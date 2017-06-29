package org.bigbluebutton.core.running

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.RecordingStatusChanged
import org.bigbluebutton.core.{ MessageRecorder, OutMessageGateway }
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender, UserJoinedMeetingEvtMsgBuilder }

trait HandlerHelpers {
  this: BaseMeetingActor =>

  def validateTokenFailed(outGW: OutMessageGateway, meetingId: String, userId: String, authToken: String,
    valid: Boolean, waitForApproval: Boolean): Unit = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId,
      userId, authToken, valid, waitForApproval)
    Sender.send(outGW, event)

    // TODO: Should disconnect user here.
  }

  def sendValidateAuthTokenRespMsg(outGW: OutMessageGateway, meetingId: String, userId: String, authToken: String,
    valid: Boolean, waitForApproval: Boolean): Unit = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId,
      userId, authToken, valid, waitForApproval)
    Sender.send(outGW, event)
  }

  def userValidatedButNeedToWaitForApproval(outGW: OutMessageGateway, liveMeeting: LiveMeeting,
    user: RegisteredUser): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    sendValidateAuthTokenRespMsg(outGW, meetingId, user.id, user.authToken, valid = true, waitForApproval = false)

    val guest = GuestWaiting(user.id, user.name, user.role)
    addGuestToWaitingForApproval(guest, liveMeeting.guestsWaiting)
    notifyModeratorsOfGuestWaiting(outGW, Vector(guest), liveMeeting.users2x, meetingId)
  }

  def addGuestToWaitingForApproval(guest: GuestWaiting, guestsWaitingList: GuestsWaiting): Unit = {
    GuestsWaiting.add(guestsWaitingList, guest)
  }

  def userValidatedAndNoNeedToWaitForApproval(outGW: OutMessageGateway, liveMeeting: LiveMeeting,
    user: RegisteredUser): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    sendValidateAuthTokenRespMsg(outGW, meetingId,
      userId = user.id, authToken = user.authToken, valid = true, waitForApproval = false)

    // TODO: REMOVE Temp only so we can implement user handling in client. (ralam june 21, 2017)

    sendAllUsersInMeeting(outGW, user.id, liveMeeting)
    sendAllVoiceUsersInMeeting(outGW, user.id, liveMeeting.voiceUsers, meetingId)
    sendAllWebcamStreams(outGW, user.id, liveMeeting.webcams, meetingId)
    userJoinMeeting(outGW, user.authToken, liveMeeting)
    if (!Users2x.hasPresenter(liveMeeting.users2x)) {
      automaticallyAssignPresenter(outGW, liveMeeting)
    }
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
    meetingId: String): Unit = {

    val vu = VoiceUsers.findAll(voiceUsers).map { u =>
      VoiceConfUser(intId = u.intId, voiceUserId = u.voiceUserId, callingWith = u.callingWith, callerName = u.callerName,
        callerNum = u.callerNum, muted = u.muted, talking = u.talking, listenOnly = u.listenOnly)
    }

    val event = MsgBuilder.buildGetVoiceUsersMeetingRespMsg(meetingId, requesterId, vu)
    Sender.send(outGW, event)
  }

  def userJoinMeeting(outGW: OutMessageGateway, authToken: String, liveMeeting: LiveMeeting): Unit = {
    for {
      regUser <- RegisteredUsers.findWithToken(authToken, liveMeeting.registeredUsers)
    } yield {
      val userState = UserState(intId = regUser.id,
        extId = regUser.externId,
        name = regUser.name,
        role = regUser.role,
        guest = regUser.guest,
        authed = regUser.authed,
        waitingForAcceptance = regUser.waitingForAcceptance,
        emoji = "none",
        presenter = false,
        locked = false,
        avatar = regUser.avatarURL)

      Users2x.add(liveMeeting.users2x, userState)

      val event = UserJoinedMeetingEvtMsgBuilder.build(liveMeeting.props.meetingProp.intId, userState)
      Sender.send(outGW, event)

      MessageRecorder.record(outGW, liveMeeting.props.recordProp.record, event.core)
      startRecordingIfAutoStart2x(liveMeeting)
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
}
