package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ AudioCaptions, VoiceUsers }
import org.bigbluebutton.core.running.LiveMeeting

trait AudioFloorChangedVoiceConfEvtMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handle(msg: AudioFloorChangedVoiceConfEvtMsg, liveMeeting: LiveMeeting): Unit = {
    for {
      vu <- VoiceUsers.findWithVoiceUserId(liveMeeting.voiceUsers, msg.body.voiceUserId)
    } yield AudioCaptions.setFloor(liveMeeting.audioCaptions, vu.intId)
  }
}
