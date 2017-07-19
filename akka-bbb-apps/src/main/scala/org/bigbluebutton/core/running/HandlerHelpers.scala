package org.bigbluebutton.core.running

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ BreakoutRoomEndedInternalMsg, DestroyMeetingInternalMsg, RecordingStatusChanged }
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }
import org.bigbluebutton.core.domain.{ MeetingExpiryTracker, MeetingState2x }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender, UserJoinedMeetingEvtMsgBuilder }

trait HandlerHelpers extends SystemConfiguration {

  def sendAllWebcamStreams(outGW: OutMessageGateway, requesterId: String, webcams: Webcams, meetingId: String): Unit = {
    val streams = org.bigbluebutton.core.models.Webcams.findAll(webcams)
    val webcamStreams = streams.map { u =>
      val msVO = MediaStreamVO(id = u.stream.id, url = u.stream.url, userId = u.stream.userId,
        attributes = u.stream.attributes, viewers = u.stream.viewers)

      WebcamStreamVO(streamId = msVO.id, stream = msVO)
    }

    val event = MsgBuilder.buildGetWebcamStreamsMeetingRespMsg(meetingId, requesterId, webcamStreams)
    Sender.send(outGW, event)
  }

  def userJoinMeeting(outGW: OutMessageGateway, authToken: String,
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
        waitingForAcceptance = regUser.waitingForAcceptance,
        emoji = "none",
        presenter = false,
        locked = false,
        avatar = regUser.avatarURL
      )
    }

    nu match {
      case Some(newUser) =>
        Users2x.add(liveMeeting.users2x, newUser)

        val event = UserJoinedMeetingEvtMsgBuilder.build(liveMeeting.props.meetingProp.intId, newUser)
        Sender.send(outGW, event)
        startRecordingIfAutoStart2x(liveMeeting)

        if (!state.expiryTracker.userHasJoined) {
          MeetingExpiryTracker.setUserHasJoined(state)
        } else {
          state
        }

      case None =>
        state
    }
  }

  def startRecordingIfAutoStart2x(liveMeeting: LiveMeeting): Unit = {
    if (liveMeeting.props.recordProp.record && !MeetingStatus2x.isRecording(liveMeeting.status) &&
      liveMeeting.props.recordProp.autoStartRecording && Users2x.numUsers(liveMeeting.users2x) == 1) {

      MeetingStatus2x.recordingStarted(liveMeeting.status)
      //     outGW.send(new RecordingStatusChanged(props.meetingProp.intId, props.recordProp.record,
      //       "system", MeetingStatus2x.isRecording(liveMeeting.status)))
    }
  }

  def automaticallyAssignPresenter(outGW: OutMessageGateway, liveMeeting: LiveMeeting): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    for {
      moderator <- Users2x.findModerator(liveMeeting.users2x)
      newPresenter <- Users2x.makePresenter(liveMeeting.users2x, moderator.intId)
    } yield {
      sendPresenterAssigned(outGW, meetingId, newPresenter.intId, newPresenter.name, newPresenter.name)
    }
  }

  def sendPresenterAssigned(outGW: OutMessageGateway, meetingId: String, intId: String, name: String, assignedBy: String): Unit = {
    def event = MsgBuilder.buildPresenterAssignedEvtMsg(meetingId, intId, name, assignedBy)
    outGW.send(event)
  }

  def endMeeting(outGW: OutMessageGateway, liveMeeting: LiveMeeting, reason: String): Unit = {
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

  def destroyMeeting(eventBus: IncomingEventBus, meetingId: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingManagerChannel, new DestroyMeetingInternalMsg(meetingId)))
  }

  def notifyParentThatBreakoutEnded(eventBus: IncomingEventBus, liveMeeting: LiveMeeting): Unit = {
    if (liveMeeting.props.meetingProp.isBreakout) {
      eventBus.publish(BigBlueButtonEvent(
        liveMeeting.props.breakoutProps.parentId,
        new BreakoutRoomEndedInternalMsg(liveMeeting.props.meetingProp.intId)
      ))
    }
  }

  def ejectAllUsersFromVoiceConf(outGW: OutMessageGateway, liveMeeting: LiveMeeting): Unit = {
    val event = MsgBuilder.buildEjectAllFromVoiceConfMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf)
    outGW.send(event)
  }

  def sendEndMeetingDueToExpiry(reason: String, eventBus: IncomingEventBus, outGW: OutMessageGateway, liveMeeting: LiveMeeting): Unit = {
    endMeeting(outGW, liveMeeting, reason)
    notifyParentThatBreakoutEnded(eventBus, liveMeeting)
    ejectAllUsersFromVoiceConf(outGW, liveMeeting)
    destroyMeeting(eventBus, liveMeeting.props.meetingProp.intId)
  }

  def sendEndMeetingDueToExpiry2(reason: String, eventBus: IncomingEventBus, outGW: OutMessageGateway, liveMeeting: LiveMeeting): Unit = {
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
}
