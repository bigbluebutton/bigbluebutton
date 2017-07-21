package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.MeetingEndReason
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.LiveMeeting

trait LogoutAndEndMeetingCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway
  val eventBus: IncomingEventBus

  def handleLogoutAndEndMeetingCmdMsg(msg: LogoutAndEndMeetingCmdMsg) {
    for {
      u <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (u.role == Roles.MODERATOR_ROLE) {
        sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_AFTER_USER_LOGGED_OUT, eventBus, outGW, liveMeeting)
      }
    }
  }
}
