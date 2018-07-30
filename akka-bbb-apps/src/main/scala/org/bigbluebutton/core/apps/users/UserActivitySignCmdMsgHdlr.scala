package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserActivitySignCmdMsg
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor

trait UserActivitySignCmdMsgHdlr {
  this: MeetingActor =>

  def handleUserActivitySignCmdMsg(msg: UserActivitySignCmdMsg): Unit = {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      Users2x.updateLastUserActivity(liveMeeting.users2x, user)
    }
  }
}
