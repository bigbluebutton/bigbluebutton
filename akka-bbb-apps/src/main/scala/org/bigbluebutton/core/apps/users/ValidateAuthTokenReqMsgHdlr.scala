package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

trait ValidateAuthTokenReqMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter
  val eventBus: InternalEventBus

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg, state: MeetingState2x): MeetingState2x = {
    log.debug("RECEIVED ValidateAuthTokenReqMsg msg {}", msg)

    var failReason = "Invalid auth token."
    var failReasonCode = EjectReasonCode.VALIDATE_TOKEN

    val regUser = RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId,
      liveMeeting.registeredUsers)

    regUser match {
      case Some(u) =>
        // Check if banned user is rejoining.
        // Fail validation if ejected user is rejoining.
        // ralam april 21, 2020
        if (u.guestStatus == GuestStatus.ALLOW && !u.banned) {
          userValidated(u, state)
        } else {
          if (u.banned) {
            failReason = "Ejected user rejoining"
            failReasonCode = EjectReasonCode.EJECTED_USER_REJOINING
          }
          validateTokenFailed(
            outGW,
            meetingId = liveMeeting.props.meetingProp.intId,
            userId = msg.header.userId,
            authToken = msg.body.authToken,
            valid = false,
            waitForApproval = false,
            failReason,
            failReasonCode,
            state
          )
        }

      case None =>
        validateTokenFailed(
          outGW,
          meetingId = liveMeeting.props.meetingProp.intId,
          userId = msg.header.userId,
          authToken = msg.body.authToken,
          valid = false,
          waitForApproval = false,
          failReason,
          failReasonCode,
          state
        )

    }
  }

  def validateTokenFailed(
      outGW:           OutMsgRouter,
      meetingId:       String,
      userId:          String,
      authToken:       String,
      valid:           Boolean,
      waitForApproval: Boolean,
      reason:          String,
      reasonCode:      String,
      state:           MeetingState2x
  ): MeetingState2x = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId, userId, authToken, valid, waitForApproval)
    outGW.send(event)

    // send a system message to force disconnection
    // Comment out as meteor will disconnect the client. Requested by Tiago (ralam apr 28, 2020)
    //Sender.sendDisconnectClientSysMsg(meetingId, userId, SystemUser.ID, reasonCode, outGW)

    state
  }

  def sendValidateAuthTokenRespMsg(meetingId: String, userId: String, authToken: String,
                                   valid: Boolean, waitForApproval: Boolean): Unit = {
    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId, userId, authToken, valid, waitForApproval)
    outGW.send(event)
  }

  def userValidated(user: RegisteredUser, state: MeetingState2x): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId
    sendValidateAuthTokenRespMsg(meetingId, user.id, user.authToken, valid = true, waitForApproval = false)
    state
  }

  def sendAllUsersInMeeting(requesterId: String): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val users = Users2x.findAll(liveMeeting.users2x)
    val webUsers = users.map { u =>
      WebUser(intId = u.intId, extId = u.extId, name = u.name, role = u.role,
        guest = u.guest, authed = u.authed, guestStatus = u.guestStatus, emoji = u.emoji,
        locked = u.locked, presenter = u.presenter, avatar = u.avatar, clientType = u.clientType)
    }

    val event = MsgBuilder.buildGetUsersMeetingRespMsg(meetingId, requesterId, webUsers)
    outGW.send(event)
  }

  def sendAllVoiceUsersInMeeting(requesterId: String, voiceUsers: VoiceUsers, meetingId: String): Unit = {
    val vu = VoiceUsers.findAll(voiceUsers).map { u =>
      VoiceConfUser(intId = u.intId, voiceUserId = u.voiceUserId, callingWith = u.callingWith, callerName = u.callerName,
        callerNum = u.callerNum, muted = u.muted, talking = u.talking, listenOnly = u.listenOnly)
    }

    val event = MsgBuilder.buildGetVoiceUsersMeetingRespMsg(meetingId, requesterId, vu)
    outGW.send(event)
  }

}
