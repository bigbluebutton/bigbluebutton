package org.bigbluebutton.core.running

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ BreakoutRoomEndedInternalMsg, DestroyMeetingInternalMsg, EndBreakoutRoomInternalMsg }
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, InternalEventBus }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, UserJoinedMeetingEvtMsgBuilder }
import org.bigbluebutton.core.util.TimeUtil

trait HandlerHelpers extends SystemConfiguration {

  def sendAllWebcamStreams(outGW: OutMsgRouter, requesterId: String, webcams: Webcams, meetingId: String): Unit = {
    val streams = org.bigbluebutton.core.models.Webcams.findAll(webcams)
    val webcamStreams = streams.map { u =>
      val msVO = MediaStreamVO(id = u.stream.id, url = u.stream.url, userId = u.stream.userId,
        attributes = u.stream.attributes, viewers = u.stream.viewers)

      WebcamStreamVO(streamId = msVO.id, stream = msVO)
    }

    val event = MsgBuilder.buildGetWebcamStreamsMeetingRespMsg(meetingId, requesterId, webcamStreams)
    outGW.send(event)
  }

  def userJoinMeeting(outGW: OutMsgRouter, authToken: String, clientType: String,
                      liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {
    val nu = for {
      regUser <- RegisteredUsers.findWithToken(authToken, liveMeeting.registeredUsers)
    } yield {
      UserState(
        intId = regUser.id,
        extId = regUser.externId,
        name = regUser.name,
        role = regUser.role,
        guest = regUser.guest,
        authed = regUser.authed,
        guestStatus = regUser.guestStatus,
        emoji = "none",
        presenter = false,
        locked = MeetingStatus2x.getPermissions(liveMeeting.status).lockOnJoin,
        avatar = regUser.avatarURL,
        clientType = clientType
      )
    }

    nu match {
      case Some(newUser) =>
        Users2x.add(liveMeeting.users2x, newUser)

        val event = UserJoinedMeetingEvtMsgBuilder.build(liveMeeting.props.meetingProp.intId, newUser)
        outGW.send(event)
        val newState = startRecordingIfAutoStart2x(outGW, liveMeeting, state)
        if (!Users2x.hasPresenter(liveMeeting.users2x)) {
          UsersApp.automaticallyAssignPresenter(outGW, liveMeeting)
        }

        newState.update(newState.expiryTracker.setUserHasJoined())
      case None =>
        state
    }
  }

  def startRecordingIfAutoStart2x(outGW: OutMsgRouter, liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {
    var newState = state
    if (liveMeeting.props.recordProp.record && !MeetingStatus2x.isRecording(liveMeeting.status) &&
      liveMeeting.props.recordProp.autoStartRecording && Users2x.numUsers(liveMeeting.users2x) == 1) {

      MeetingStatus2x.recordingStarted(liveMeeting.status)

      val tracker = state.recordingTracker.startTimer(TimeUtil.timeNowInMs())

      def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
        val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
        val body = RecordingStatusChangedEvtMsgBody(recording, userId)
        val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
        val event = RecordingStatusChangedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildRecordingStatusChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)
      )
      outGW.send(event)
      newState = state.update(tracker)
    }
    newState
  }

  def stopRecordingIfAutoStart2x(outGW: OutMsgRouter, liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {
    var newState = state
    if (liveMeeting.props.recordProp.record && MeetingStatus2x.isRecording(liveMeeting.status) &&
      liveMeeting.props.recordProp.autoStartRecording && Users2x.numUsers(liveMeeting.users2x) == 0) {

      MeetingStatus2x.recordingStopped(liveMeeting.status)

      val tracker = state.recordingTracker.pauseTimer(TimeUtil.timeNowInMs())

      def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
        val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
        val body = RecordingStatusChangedEvtMsgBody(recording, userId)
        val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
        val event = RecordingStatusChangedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildRecordingStatusChangedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        "system", MeetingStatus2x.isRecording(liveMeeting.status)
      )
      outGW.send(event)
      newState = state.update(tracker)
    }
    newState
  }

  def endMeeting(outGW: OutMsgRouter, liveMeeting: LiveMeeting, reason: String): Unit = {
    def buildMeetingEndingEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingEndingEvtMsg.NAME, routing)
      val body = MeetingEndingEvtMsgBody(meetingId, reason)
      val header = BbbClientMsgHeader(MeetingEndingEvtMsg.NAME, meetingId, "not-used")
      val event = MeetingEndingEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val endingEvent = buildMeetingEndingEvtMsg(liveMeeting.props.meetingProp.intId)

    // Broadcast users the meeting will end
    outGW.send(endingEvent)

    MeetingStatus2x.meetingHasEnded(liveMeeting.status)

    def buildMeetingEndedEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(MeetingEndedEvtMsg.NAME, routing)
      val body = MeetingEndedEvtMsgBody(meetingId)
      val header = BbbCoreBaseHeader(MeetingEndedEvtMsg.NAME)
      val event = MeetingEndedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val endedEvnt = buildMeetingEndedEvtMsg(liveMeeting.props.meetingProp.intId)
    outGW.send(endedEvnt)
  }

  def destroyMeeting(eventBus: InternalEventBus, meetingId: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, new DestroyMeetingInternalMsg(meetingId)))
  }

  def notifyParentThatBreakoutEnded(eventBus: InternalEventBus, liveMeeting: LiveMeeting): Unit = {
    if (liveMeeting.props.meetingProp.isBreakout) {
      eventBus.publish(BigBlueButtonEvent(
        liveMeeting.props.breakoutProps.parentId,
        new BreakoutRoomEndedInternalMsg(liveMeeting.props.meetingProp.intId)
      ))
    }
  }

  def ejectAllUsersFromVoiceConf(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    val event = MsgBuilder.buildEjectAllFromVoiceConfMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf)
    outGW.send(event)
  }

  def endAllBreakoutRooms(eventBus: InternalEventBus, liveMeeting: LiveMeeting, state: MeetingState2x): MeetingState2x = {
    for {
      model <- state.breakout
    } yield {
      model.rooms.values.foreach { room =>
        eventBus.publish(BigBlueButtonEvent(room.id, EndBreakoutRoomInternalMsg(liveMeeting.props.breakoutProps.parentId, room.id)))
      }
    }

    state.update(None)
  }

  def sendEndMeetingDueToExpiry(reason: String, eventBus: InternalEventBus, outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    endMeeting(outGW, liveMeeting, reason)
    notifyParentThatBreakoutEnded(eventBus, liveMeeting)
    ejectAllUsersFromVoiceConf(outGW, liveMeeting)
    destroyMeeting(eventBus, liveMeeting.props.meetingProp.intId)
  }

  def sendEndMeetingDueToExpiry2(reason: String, eventBus: InternalEventBus, outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    val endMeetingEvt = buildMeetingEndingEvtMsg(reason, meetingId)
    outGW.send(endMeetingEvt)

    val endedEvt = buildMeetingEndedEvtMsg(meetingId)
    outGW.send(endedEvt)

    if (liveMeeting.props.meetingProp.isBreakout) {
      eventBus.publish(BigBlueButtonEvent(
        liveMeeting.props.breakoutProps.parentId,
        new BreakoutRoomEndedInternalMsg(meetingId)
      ))
    }

    val event = MsgBuilder.buildEjectAllFromVoiceConfMsg(meetingId, liveMeeting.props.voiceProp.voiceConf)
    outGW.send(event)

    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, new DestroyMeetingInternalMsg(meetingId)))

    MeetingStatus2x.meetingHasEnded(liveMeeting.status)
  }

  def buildMeetingEndingEvtMsg(reason: String, meetingId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(MeetingEndingEvtMsg.NAME, routing)
    val body = MeetingEndingEvtMsgBody(meetingId, reason)
    val header = BbbClientMsgHeader(MeetingEndingEvtMsg.NAME, meetingId, "not-used")
    val event = MeetingEndingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildMeetingEndedEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MeetingEndedEvtMsg.NAME, routing)
    val body = MeetingEndedEvtMsgBody(meetingId)
    val header = BbbCoreBaseHeader(MeetingEndedEvtMsg.NAME)
    val event = MeetingEndedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildRemoveUserFromPresenterGroup(meetingId: String, userId: String, requesterId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserRemovedFromPresenterGroupEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRemovedFromPresenterGroupEvtMsg.NAME, meetingId, userId)
    val body = UserRemovedFromPresenterGroupEvtMsgBody(userId, requesterId)
    val event = UserRemovedFromPresenterGroupEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }
}
