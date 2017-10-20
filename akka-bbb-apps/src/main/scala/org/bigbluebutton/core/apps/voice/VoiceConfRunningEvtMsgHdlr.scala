package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs.VoiceConfRunningEvtMsg
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait VoiceConfRunningEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleVoiceConfRunningEvtMsg(msg: VoiceConfRunningEvtMsg): Unit = {
    log.info("Received VoiceConfRunningEvtMsg " + msg.body.running)
  }
}
