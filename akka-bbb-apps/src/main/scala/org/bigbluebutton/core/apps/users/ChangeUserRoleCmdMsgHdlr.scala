package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ RegisteredUser, RegisteredUsers, Roles, UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.core.db.{ NotificationDAO, UserDAO }
import org.bigbluebutton.core.graphql.GraphqlMiddleware
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ChangeUserRoleCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserRoleCmdMsg(msg: ChangeUserRoleCmdMsg): Unit = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change user role in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      for {
        uvo <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
        u <- RegisteredUsers.findWithUserId(uvo.intId, liveMeeting.registeredUsers)
      } yield {
        val newRole = if (msg.body.role == Roles.MODERATOR_ROLE) Roles.MODERATOR_ROLE else Roles.VIEWER_ROLE

        val allowPromoteGuestToModerator = !liveMeeting.props.usersProp.authenticatedGuest || liveMeeting.props.usersProp.allowPromoteGuestToModerator
        if (msg.body.role == Roles.MODERATOR_ROLE && (!uvo.guest || allowPromoteGuestToModerator)) {
          // Promote user flow
          changeRole(uvo, u, newRole, msg.body.changedBy)

          val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
            msg.body.userId,
            liveMeeting.props.meetingProp.intId,
            "info",
            "user",
            "app.toast.promotedLabel",
            "Notification message when promoted",
            Map()
          )
          outGW.send(notifyEvent)
          NotificationDAO.insert(notifyEvent)
        } else if (msg.body.role == Roles.VIEWER_ROLE) {
          // Demote user flow
          changeRole(uvo, u, newRole, msg.body.changedBy)
          LockSettingsUtil.enforceCamLockSettingsForAllUsers(liveMeeting, outGW)

          val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
            msg.body.userId,
            liveMeeting.props.meetingProp.intId,
            "info",
            "user",
            "app.toast.demotedLabel",
            "Notification message when demoted",
            Map()
          )
          outGW.send(notifyEvent)
          NotificationDAO.insert(notifyEvent)
        }
      }
    }
  }

  private def buildUserRoleChangedEvtMsg(meetingId: String, userId: String, changedBy: String, role: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserRoleChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRoleChangedEvtMsg.NAME, meetingId, changedBy)
    val body = UserRoleChangedEvtMsgBody(userId, role, changedBy)
    val event = UserRoleChangedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  private def changeRole(uvo: UserState, u: RegisteredUser, newRole: String, changedBy: String): Unit = {
    //Update memory
    Users2x.changeRole(liveMeeting.users2x, uvo, newRole)
    val newRegUser = RegisteredUsers.updateUserRole(liveMeeting.registeredUsers, u, newRole)

    // Force reconnection with graphql to refresh permissions
    GraphqlMiddleware.requestGraphqlReconnection(u.sessionToken, "role_changed")

    // Update the database
    UserDAO.update(newRegUser)

    //Send Evt redis msg
    val event = buildUserRoleChangedEvtMsg(liveMeeting.props.meetingProp.intId, u.id, changedBy, newRole)
    outGW.send(event)
  }

}
