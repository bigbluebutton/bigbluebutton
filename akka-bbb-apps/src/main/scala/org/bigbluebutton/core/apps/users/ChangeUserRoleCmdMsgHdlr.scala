package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ RegisteredUsers, Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ChangeUserRoleCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserRoleCmdMsg(msg: ChangeUserRoleCmdMsg) {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change user role in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      for {
        uvo <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
      } yield {

        val userRole = if (uvo.role == Roles.MODERATOR_ROLE) "MODERATOR" else "VIEWER"
        for {
          // Update guest from waiting list
          u <- RegisteredUsers.findWithUserId(uvo.intId, liveMeeting.registeredUsers)
        } yield {
          RegisteredUsers.updateUserRole(liveMeeting.registeredUsers, u, userRole)
        }

        if (msg.body.role == Roles.MODERATOR_ROLE && !uvo.guest) {
          // Promote non-guest users.
          Users2x.changeRole(liveMeeting.users2x, uvo, msg.body.role)
          val event = buildUserRoleChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId,
            msg.body.changedBy, "MODERATOR")
          outGW.send(event)
        } else if (msg.body.role == Roles.VIEWER_ROLE) {
          Users2x.changeRole(liveMeeting.users2x, uvo, msg.body.role)
          val event = buildUserRoleChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId,
            msg.body.changedBy, "VIEWER")
          outGW.send(event)
        }
      }
    }
  }

  def buildUserRoleChangedEvtMsg(meetingId: String, userId: String, changedBy: String, role: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserRoleChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRoleChangedEvtMsg.NAME, meetingId, changedBy)
    val body = UserRoleChangedEvtMsgBody(userId, role, changedBy)
    val event = UserRoleChangedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }
}
