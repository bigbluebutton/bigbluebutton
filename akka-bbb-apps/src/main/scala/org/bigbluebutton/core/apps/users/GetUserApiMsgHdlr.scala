package org.bigbluebutton.core.apps.users

import org.apache.pekko.actor.ActorRef
import org.bigbluebutton.core.api.{ ApiResponseFailure, ApiResponseSuccess, GetUserApiMsg, UserInfosApiMsg }
import org.bigbluebutton.core.models.{ RegisteredUser, RegisteredUsers, Roles, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, OutMsgRouter }

trait GetUserApiMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetUserApiMsg(msg: GetUserApiMsg, actorRef: ActorRef): Unit = {
    RegisteredUsers.findWithSessionToken(msg.sessionToken, liveMeeting.registeredUsers) match {
      case Some(regUser) =>
        log.debug("replying GetUserApiMsg with success ({}). User: {}", msg.sessionToken, regUser.id)
        actorRef ! ApiResponseSuccess("User found!", UserInfosApiMsg(getUserInfoResponse(regUser, msg.sessionToken)))
      case None =>
        log.debug("User not found, sending failure message ({}).", msg.sessionToken)
        actorRef ! ApiResponseFailure("User not found", "user_not_found", Map())
    }
  }

  private def getUserInfoResponse(regUser: RegisteredUser, sessionToken: String): Map[String, Any] = {
    val isModerator = (regUser.role == Roles.MODERATOR_ROLE)
    val isLocked = Users2x.findWithIntId(liveMeeting.users2x, regUser.id).exists(u => u.locked)
    val userStateExists = Users2x.findWithIntId(liveMeeting.users2x, regUser.id).nonEmpty

    val currentlyInMeeting = regUser.joined && !regUser.loggedOut && !regUser.ejected && userStateExists

    var userInfos: Map[String, Any] = Map()
    userInfos += ("returncode" -> "SUCCESS")
    userInfos += ("meetingID" -> liveMeeting.props.meetingProp.intId)
    userInfos += ("externMeetingID" -> liveMeeting.props.meetingProp.extId)
    userInfos += ("externUserID" -> regUser.externId)
    userInfos += ("internalUserID" -> regUser.id)
    userInfos += ("currentlyInMeeting" -> currentlyInMeeting)
    userInfos += ("authToken" -> regUser.authToken)
    userInfos += ("sessionToken" -> sessionToken)
    userInfos += ("role" -> regUser.role)
    userInfos += ("guest" -> regUser.guest)
    userInfos += ("guestStatus" -> regUser.guestStatus)
    userInfos += ("moderator" -> isModerator)
    userInfos += ("presenter" -> Users2x.userIsInPresenterGroup(liveMeeting.users2x, regUser.id))
    userInfos += ("isBreakout" -> liveMeeting.props.meetingProp.isBreakout)
    // Which lock settings apply to a locked viewer is no longer resolved here: the
    // Hasura permission rules read the current meeting_lockSettings row directly,
    // so a meeting-wide lock change propagates as data without reconnecting anyone.
    // The connection only carries whether this user is a locked viewer.
    userInfos += ("locked" -> (!isModerator && isLocked))

    userInfos
  }

}
