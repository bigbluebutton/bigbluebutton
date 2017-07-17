package org.bigbluebutton.core.running

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ BreakoutRoomEndedInternalMsg, DestroyMeetingInternalMsg, RecordingStatusChanged }
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }
import org.bigbluebutton.core.domain.{ MeetingExpiryTracker, MeetingState2x }
import org.bigbluebutton.core.{ OutMessageGateway }
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender, UserJoinedMeetingEvtMsgBuilder }

trait HandlerHelpers extends SystemConfiguration {

  def validateTokenFailed(outGW: OutMessageGateway, meetingId: String, userId: String, authToken: String,
                          valid: Boolean, waitForApproval: Boolean, state: MeetingState2x): MeetingState2x = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId, userId, authToken, valid, waitForApproval)
    Sender.send(outGW, event)

    // TODO: Should disconnect user here.

    state
  }

  def sendValidateAuthTokenRespMsg(outGW: OutMessageGateway, meetingId: String, userId: String, authToken: String,
                                   valid: Boolean, waitForApproval: Boolean): Unit = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId, userId, authToken, valid, waitForApproval)
    Sender.send(outGW, event)
  }

  def userValidatedButNeedToWaitForApproval(outGW: OutMessageGateway, liveMeeting: LiveMeeting,
                                            user: RegisteredUser, state: MeetingState2x): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId
    sendValidateAuthTokenRespMsg(outGW, meetingId, user.id, user.authToken, valid = true, waitForApproval = false)

    val guest = GuestWaiting(user.id, user.name, user.role)
    addGuestToWaitingForApproval(guest, liveMeeting.guestsWaiting)
    notifyModeratorsOfGuestWaiting(outGW, Vector(guest), liveMeeting.users2x, meetingId)

    state
  }

  def addGuestToWaitingForApproval(guest: GuestWaiting, guestsWaitingList: GuestsWaiting): Unit = {
    GuestsWaiting.add(guestsWaitingList, guest)
  }

  def userValidatedAndNoNeedToWaitForApproval(
    outGW:       OutMessageGateway,
    liveMeeting: LiveMeeting,
    user:        RegisteredUser,
    state:       MeetingState2x
  ): MeetingState2x = {

    val meetingId = liveMeeting.props.meetingProp.intId
    sendValidateAuthTokenRespMsg(outGW, meetingId,
      userId = user.id, authToken = user.authToken, valid = true, waitForApproval = false)

    // TODO: REMOVE Temp only so we can implement user handling in client. (ralam june 21, 2017)

    sendAllUsersInMeeting(outGW, user.id, liveMeeting)
    sendAllVoiceUsersInMeeting(outGW, user.id, liveMeeting.voiceUsers, meetingId)
    sendAllWebcamStreams(outGW, user.id, liveMeeting.webcams, meetingId)
    val newState = userJoinMeeting(outGW, user.authToken, liveMeeting, state)
    if (!Users2x.hasPresenter(liveMeeting.users2x)) {
      automaticallyAssignPresenter(outGW, liveMeeting)
    }
    newState
  }

  def notifyModeratorsOfGuestWaiting(outGW: OutMessageGateway, guests: Vector[GuestWaiting], users: Users2x, meetingId: String): Unit = {
    val mods = Users2x.findAll(users).filter(p => p.role == Roles.MODERATOR_ROLE)
    mods foreach { m =>
      val event = MsgBuilder.buildGuestsWaitingForApprovalEvtMsg(meetingId, m.intId, guests)
      Sender.send(outGW, event)
    }
  }

  def sendAllUsersInMeeting(outGW: OutMessageGateway, requesterId: String, liveMeeting: LiveMeeting): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val users = Users2x.findAll(liveMeeting.users2x)
    val webUsers = users.map { u =>
      WebUser(intId = u.intId, extId = u.extId, name = u.name, role = u.role,
        guest = u.guest, authed = u.authed, waitingForAcceptance = u.waitingForAcceptance, emoji = u.emoji,
        locked = u.locked, presenter = u.presenter, avatar = u.avatar)
    }

    val event = MsgBuilder.buildGetUsersMeetingRespMsg(meetingId, requesterId, webUsers)
    Sender.send(outGW, event)
  }

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

  def sendAllVoiceUsersInMeeting(outGW: OutMessageGateway, requesterId: String,
                                 voiceUsers: VoiceUsers,
                                 meetingId:  String): Unit = {

    val vu = VoiceUsers.findAll(voiceUsers).map { u =>
      VoiceConfUser(intId = u.intId, voiceUserId = u.voiceUserId, callingWith = u.callingWith, callerName = u.callerName,
        callerNum = u.callerNum, muted = u.muted, talking = u.talking, listenOnly = u.listenOnly)
    }

    val event = MsgBuilder.buildGetVoiceUsersMeetingRespMsg(meetingId, requesterId, vu)
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

  def endMeeting(outGW: OutMessageGateway, liveMeeting: LiveMeeting): Unit = {
    def buildMeetingEndingEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingEndingEvtMsg.NAME, routing)
      val body = MeetingEndingEvtMsgBody(meetingId)
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
    eventBus.publish(BigBlueButtonEvent(
      liveMeeting.props.breakoutProps.parentId,
      new BreakoutRoomEndedInternalMsg(liveMeeting.props.meetingProp.intId)
    ))
  }
}
