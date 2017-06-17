package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.api.ChangeUserRole
import org.bigbluebutton.core.running.MeetingActor

trait ChangeUserRoleHdlr {
  this: MeetingActor =>

  def handle(msg: ChangeUserRole): Unit = {
    usersApp2x.handle(msg)
  }
}
