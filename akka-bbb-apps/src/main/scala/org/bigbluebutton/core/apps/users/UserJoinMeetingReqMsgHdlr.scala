package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserJoinMeetingReqMsg
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.db.{ NotificationDAO, UserDAO, UserStateDAO }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running._
import org.bigbluebutton.core2.message.senders._

trait UserJoinMeetingReqMsgHdlr extends HandlerHelpers {
  this: MeetingActor =>
  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinMeetingReqMsg(msg: UserJoinMeetingReqMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Received user joined meeting. user {} meetingId={}", msg.body.userId, msg.header.meetingId)

    Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId) match {
      case Some(user) => handleUserReconnecting(user, msg, state)
      case None       => handleUserJoining(msg, state)
    }
  }

  private def handleUserJoining(msg: UserJoinMeetingReqMsg, state: MeetingState2x): MeetingState2x = {

    val regUser = RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers)
    log.info(s"Number of registered users [${RegisteredUsers.numRegisteredUsers(liveMeeting.registeredUsers)}]")

    regUser.fold {
      handleFailedUserJoin(msg, "Invalid auth token.", EjectReasonCode.VALIDATE_TOKEN)
      state
    } { user =>
      val validationResult = for {
        _ <- checkIfUserGuestStatusIsAllowed(user)
        _ <- checkIfUserIsBanned(user)
        _ <- checkIfUserLoggedOut(user)
        _ <- validateMaxParticipants(user)
      } yield user

      validationResult.fold(
        reason => handleFailedUserJoin(msg, reason._1, reason._2),
        validUser => handleSuccessfulUserJoin(msg, validUser)
      )
    }
  }

  private def handleSuccessfulUserJoin(msg: UserJoinMeetingReqMsg, regUser: RegisteredUser) = {
    if (Users2x.numUsers(liveMeeting.users2x) == 0) meetingEndTime = 0
    val newState = userJoinMeeting(outGW, msg.body.authToken, msg.body.clientType, liveMeeting, state)
    updateParentMeetingWithNewListOfUsers()
    notifyPreviousUsersWithSameExtId(regUser)
    clearCachedVoiceUser(regUser)
    clearExpiredUserState(regUser)
    ForceUserGraphqlReconnection(regUser)

    newState
  }

  private def handleFailedUserJoin(msg: UserJoinMeetingReqMsg, failReason: String, failReasonCode: String) = {
    log.info("Ignoring user {} attempt to join in meeting {}. Reason Code: {}, Reason Message: {}", msg.body.userId, msg.header.meetingId, failReasonCode, failReason)
    UserDAO.updateJoinError(msg.header.meetingId, msg.body.userId, failReasonCode, failReason)
    state
  }

  private def handleUserReconnecting(user: UserState, msg: UserJoinMeetingReqMsg, state: MeetingState2x): MeetingState2x = {
    if (user.userLeftFlag.left) {
      resetUserLeftFlag(msg)
    }
    state
  }

  private def resetUserLeftFlag(msg: UserJoinMeetingReqMsg) = {
    log.info("Resetting flag that user left meeting. user {}", msg.body.userId)
    sendUserLeftFlagUpdatedEvtMsg(outGW, liveMeeting, msg.body.userId, leftFlag = false)
    Users2x.resetUserLeftFlag(liveMeeting.users2x, msg.body.userId)
  }

  private def validateMaxParticipants(regUser: RegisteredUser): Either[(String, String), Unit] = {
    val userHasJoinedAlready = RegisteredUsers.checkUserExtIdHasJoined(regUser.externId, liveMeeting.registeredUsers)
    val maxParticipants = liveMeeting.props.usersProp.maxUsers - 1

    if (maxParticipants > 0 && //0 = no limit
      RegisteredUsers.numUniqueJoinedUsers(liveMeeting.registeredUsers) >= maxParticipants &&
      !userHasJoinedAlready) {
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

  private def updateParentMeetingWithNewListOfUsers() = {
    if (liveMeeting.props.meetingProp.isBreakout) {
      BreakoutHdlrHelpers.updateParentMeetingWithUsers(liveMeeting, eventBus)
    }
  }

  private def notifyPreviousUsersWithSameExtId(regUser: RegisteredUser) = {
    RegisteredUsers.findAllWithExternUserId(regUser.externId, liveMeeting.registeredUsers)
      .filter(_.id != regUser.id)
      .foreach { previousUser =>
        sendUserConnectedNotification(previousUser, regUser, liveMeeting)
      }
  }

  private def sendUserConnectedNotification(previousUser: RegisteredUser, newUser: RegisteredUser, liveMeeting: LiveMeeting) = {
    val notifyUserEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
      previousUser.id,
      liveMeeting.props.meetingProp.intId,
      "info",
      "promote",
      "app.mobileAppModal.userConnectedWithSameId",
      "Notification to warn that user connect again from other browser/device",
      Vector(newUser.name)
    )
    outGW.send(notifyUserEvent)
    NotificationDAO.insert(notifyUserEvent)
  }

  private def clearCachedVoiceUser(regUser: RegisteredUser) =
    // fresh user joined (not due to reconnection). Clear (pop) the cached voice user
    VoiceUsers.recoverVoiceUser(liveMeeting.voiceUsers, regUser.id)

  private def clearExpiredUserState(regUser: RegisteredUser) =
    UserStateDAO.updateExpired(regUser.meetingId, regUser.id, false)

  private def ForceUserGraphqlReconnection(regUser: RegisteredUser) =
    Sender.sendForceUserGraphqlReconnectionSysMsg(liveMeeting.props.meetingProp.intId, regUser.id, regUser.sessionToken, "user_joined", outGW)

}
