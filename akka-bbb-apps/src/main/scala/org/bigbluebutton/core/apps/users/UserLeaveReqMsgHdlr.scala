package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserLeaveReqMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait UserLeaveReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserLeaveReqMsg(msg: UserLeaveReqMsg, state: MeetingState2x): MeetingState2x = {
    Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId) match {
      case Some(reconnectingUser) =>
        if (!reconnectingUser.userLeftFlag.left) {
          // Just flag that user has left as the user might be reconnecting.
          // An audit will remove this user if it hasn't rejoined after a certain period of time.
          // ralam oct 23, 2018
          Users2x.setUserLeftFlag(liveMeeting.users2x, msg.body.userId)
        }
        state
      case None =>
        state
    }
  }

}
