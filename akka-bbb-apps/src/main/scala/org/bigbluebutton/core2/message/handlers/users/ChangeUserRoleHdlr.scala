package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ChangeUserRole, UserRoleChange}
import org.bigbluebutton.core.models.{RegisteredUsers, Roles, Users}
import org.bigbluebutton.core.running.MeetingActor

trait ChangeUserRoleHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway


  def handleChangeUserRole(msg: ChangeUserRole) {
    for {
      uvo <- Users.changeRole(msg.userID, liveMeeting.users, msg.role)
    } yield {
      RegisteredUsers.updateRegUser(uvo, liveMeeting.registeredUsers)
      val userRole = if (msg.role == Roles.MODERATOR_ROLE) "MODERATOR" else "VIEWER"
      outGW.send(new UserRoleChange(props.meetingProp.intId, props.recordProp.record, msg.userID, userRole))
    }
  }
}
