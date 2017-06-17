package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api.{ ChangeUserRole, UserRoleChange }
import org.bigbluebutton.core.models.{ Roles, Users2x }

trait ChangeUserRoleHdlr {
  this: UsersApp2x =>

  def handle(msg: ChangeUserRole) {
    for {
      uvo <- Users2x.changeRole(liveMeeting.users2x, msg.userID, msg.role)
    } yield {
      val userRole = if (msg.role == Roles.MODERATOR_ROLE) "MODERATOR" else "VIEWER"
      outGW.send(new UserRoleChange(liveMeeting.props.meetingProp.intId,
        liveMeeting.props.recordProp.record, msg.userID, userRole))
    }
  }
}
