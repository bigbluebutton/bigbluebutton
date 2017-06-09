package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages.voiceconf.UserJoinedVoiceConfEvtMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.MeetingActor

trait UserJoinedVoiceConfEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handle(msg: UserJoinedVoiceConfEvtMsg): Unit = {
    log.warning("Received user joined voice conference " + msg)
  }
}
