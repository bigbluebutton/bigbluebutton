package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

trait ValidateAuthTokenReqMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway
  val eventBus: IncomingEventBus

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg, state: MeetingState2x): MeetingState2x = {
    log.debug("RECEIVED ValidateAuthTokenReqMsg msg {}", msg)

    RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers) match {
      case Some(u) =>
        val guestPolicyType = GuestsWaiting.getGuestPolicy(liveMeeting.guestsWaiting).policy
        if (guestPolicyType == GuestPolicyType.ALWAYS_ACCEPT) {
          userValidatedAndNoNeedToWaitForApproval(outGW, liveMeeting, u, state)
        } else if (guestPolicyType == GuestPolicyType.ASK_MODERATOR) {
          if (u.guest && u.waitingForAcceptance) {
            userValidatedButNeedToWaitForApproval(u, state)
          } else {
            userValidatedAndNoNeedToWaitForApproval(outGW, liveMeeting, u, state)
          }
        } else {
          validateTokenFailed(outGW, meetingId = liveMeeting.props.meetingProp.intId,
            userId = msg.body.userId, authToken = msg.body.authToken, valid = false, waitForApproval = false, state)
        }
      case None =>
        validateTokenFailed(outGW, meetingId = liveMeeting.props.meetingProp.intId,
          userId = msg.body.userId, authToken = msg.body.authToken, valid = false, waitForApproval = false, state)
    }
  }

  def validateTokenFailed(outGW: OutMessageGateway, meetingId: String, userId: String, authToken: String,
                          valid: Boolean, waitForApproval: Boolean, state: MeetingState2x): MeetingState2x = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId, userId, authToken, valid, waitForApproval)
    Sender.send(outGW, event)

    // TODO: Should disconnect user here.

    state
  }

  def sendValidateAuthTokenRespMsg(meetingId: String, userId: String, authToken: String,
                                   valid: Boolean, waitForApproval: Boolean): Unit = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId, userId, authToken, valid, waitForApproval)
    Sender.send(outGW, event)
  }

  def userValidatedButNeedToWaitForApproval(user: RegisteredUser, state: MeetingState2x): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId
    sendValidateAuthTokenRespMsg(meetingId, user.id, user.authToken, valid = true, waitForApproval = false)

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
    sendValidateAuthTokenRespMsg(
      meetingId,
      userId = user.id, authToken = user.authToken, valid = true, waitForApproval = false
    )

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
}
