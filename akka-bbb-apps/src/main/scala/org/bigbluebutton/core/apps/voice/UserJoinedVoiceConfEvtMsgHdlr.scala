package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }

trait UserJoinedVoiceConfEvtMsgHdlr extends SystemConfiguration {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinedVoiceConfEvtMsg(msg: UserJoinedVoiceConfEvtMsg): Unit = {
    log.info("Received user joined voice conference " + msg)

    VoiceApp.handleUserJoinedVoiceConfEvtMsg(
      liveMeeting,
      outGW,
      eventBus,
      msg.body.voiceConf,
      msg.body.intId,
      msg.body.voiceUserId,
      msg.body.callingWith,
      msg.body.callerIdName,
      msg.body.callerIdNum,
      msg.body.muted,
      msg.body.talking,
      "freeswitch"
    )
  }
}
