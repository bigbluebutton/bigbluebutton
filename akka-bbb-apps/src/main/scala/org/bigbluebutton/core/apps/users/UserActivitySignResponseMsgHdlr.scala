package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserActivitySignResponseMsg
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor

trait UserActivitySignResponseMsgHdlr {
  this: MeetingActor =>

  def handleUserActivitySignResponseMsg(msg: UserActivitySignResponseMsg): Unit = {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      Users2x.updateLastUserActivity(liveMeeting.users2x, user)
    }
  }
}
