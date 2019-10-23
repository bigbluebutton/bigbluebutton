package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs.UserStatusVoiceConfEvtMsg
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait UserStatusVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserStatusVoiceConfEvtMsg(msg: UserStatusVoiceConfEvtMsg): Unit = {
    println("************* RECEIVED UserStatusVoiceConfEvtMsg *************")
    msg.body.confUsers foreach { cm =>
      println("user " + cm.callerIdName)
    }

    msg.body.confRecordings foreach { cr =>
      println("rec = " + cr.recordPath)
    }
  }
}
