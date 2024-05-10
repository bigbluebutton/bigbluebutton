package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.db.UserDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ValidateAuthTokenReqMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter
  val eventBus: InternalEventBus

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg, state: MeetingState2x): MeetingState2x = {
    log.debug(s"Received ValidateAuthTokenReqMsg msg $msg")

    val regUser = RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers)
    log.info(s"Number of registered users [${RegisteredUsers.numRegisteredUsers(liveMeeting.registeredUsers)}]")

    regUser.fold {
      sendFailedValidateAuthTokenRespMsg(msg, "Invalid auth token.", EjectReasonCode.VALIDATE_TOKEN)
    } { user =>
      val validationResult = for {
        _ <- checkIfUserGuestStatusIsAllowed(user)
        _ <- checkIfUserIsBanned(user)
        _ <- checkIfUserLoggedOut(user)
        _ <- validateMaxParticipants(user)
      } yield user

      validationResult.fold(
        reason => sendFailedValidateAuthTokenRespMsg(msg, reason._1, reason._2),
        validUser => sendSuccessfulValidateAuthTokenRespMsg(validUser)
      )
    }

    state
  }

  private def validateMaxParticipants(user: RegisteredUser): Either[(String, String), Unit] = {
    if (liveMeeting.props.usersProp.maxUsers > 0 &&
      RegisteredUsers.numUniqueJoinedUsers(liveMeeting.registeredUsers) >= liveMeeting.props.usersProp.maxUsers &&
      RegisteredUsers.checkUserExtIdHasJoined(user.externId, liveMeeting.registeredUsers) == false) {
      Left(("The maximum number of participants allowed for this meeting has been reached.", EjectReasonCode.MAX_PARTICIPANTS))
    } else {
      Right(())
    }
  }

  private def checkIfUserGuestStatusIsAllowed(user: RegisteredUser): Either[(String, String), Unit] = {
    if (user.guestStatus != GuestStatus.ALLOW) {
      Left(("User is not allowed to join", EjectReasonCode.PERMISSION_FAILED))
    } else {
      Right(())
    }
  }

  private def checkIfUserIsBanned(user: RegisteredUser): Either[(String, String), Unit] = {
    if (user.banned) {
      Left(("Banned user rejoining", EjectReasonCode.BANNED_USER_REJOINING))
    } else {
      Right(())
    }
  }

  private def checkIfUserLoggedOut(user: RegisteredUser): Either[(String, String), Unit] = {
    if (user.loggedOut) {
      Left(("User had logged out", EjectReasonCode.USER_LOGGED_OUT))
    } else {
      Right(())
    }
  }

  private def sendFailedValidateAuthTokenRespMsg(msg: ValidateAuthTokenReqMsg, failReason: String, failReasonCode: String) = {
    UserDAO.updateJoinError(msg.header.meetingId, msg.body.userId, failReasonCode, failReason)

    val event = MsgBuilder.buildValidateAuthTokenRespMsg(liveMeeting.props.meetingProp.intId, msg.header.userId, msg.body.authToken, false, false, 0,
      0, failReasonCode, failReason)
    outGW.send(event)
  }

  def sendSuccessfulValidateAuthTokenRespMsg(user: RegisteredUser) = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val updatedUser = RegisteredUsers.updateUserLastAuthTokenValidated(liveMeeting.registeredUsers, user)

    val event = MsgBuilder.buildValidateAuthTokenRespMsg(meetingId, updatedUser.id, updatedUser.authToken, true, false, updatedUser.registeredOn,
      updatedUser.lastAuthTokenValidatedOn, EjectReasonCode.NOT_EJECT, "User not ejected")
    outGW.send(event)
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
        callerNum = u.callerNum, color = u.color, muted = u.muted, talking = u.talking, listenOnly = u.listenOnly)
    }

    val event = MsgBuilder.buildGetVoiceUsersMeetingRespMsg(meetingId, requesterId, vu)
    outGW.send(event)
  }

}
