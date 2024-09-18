package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UserJoinedVoiceConfMessageHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter
}
