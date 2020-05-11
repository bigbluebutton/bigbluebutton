package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.GuestWaitingLeftMsg
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.models.GuestsWaiting
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait GuestWaitingLeftMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGuestWaitingLeftMsg(msg: GuestWaitingLeftMsg): Unit = {
    GuestsWaiting.remove(liveMeeting.guestsWaiting, msg.body.userId)
    UsersApp.guestWaitingLeft(liveMeeting, msg.body.userId, outGW)
  }
}
