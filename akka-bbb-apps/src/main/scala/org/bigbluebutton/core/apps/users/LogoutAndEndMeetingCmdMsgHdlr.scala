package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.{ IncomingEventBus }
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
        endMeeting(outGW, liveMeeting)

        if (liveMeeting.props.meetingProp.isBreakout) {
          log.info(
            "Informing parent meeting {} that a breakout room has been ended {}",
            liveMeeting.props.breakoutProps.parentId, liveMeeting.props.meetingProp.intId
          )
          notifyParentThatBreakoutEnded(eventBus, liveMeeting)
        }

        destroyMeeting(eventBus, liveMeeting.props.meetingProp.intId)
      }
    }
  }
}
