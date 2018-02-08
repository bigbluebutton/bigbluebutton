package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ RegisteredUsers, Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait ChangeUserRoleCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserRoleCmdMsg(msg: ChangeUserRoleCmdMsg) {
    for {
      uvo <- Users2x.changeRole(liveMeeting.users2x, msg.body.userId, msg.body.role)
    } yield {
      val userRole = if (uvo.role == Roles.MODERATOR_ROLE) "MODERATOR" else "VIEWER"
      for {
        // Update guest from waiting list
        u <- RegisteredUsers.findWithUserId(uvo.intId, liveMeeting.registeredUsers)
      } yield {
        RegisteredUsers.updateUserRole(liveMeeting.registeredUsers, u, userRole)
      }
      val event = buildUserRoleChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId,
        msg.body.changedBy, userRole)

      outGW.send(event)
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
