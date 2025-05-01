package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait AudioFloorChangedVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAudioFloorChangedVoiceConfEvtMsg(msg: AudioFloorChangedVoiceConfEvtMsg): Unit = {

    VoiceApp.releasedFloor(
      liveMeeting,
      outGW,
      msg.body.oldVoiceUserId,
      msg.body.floorTimestamp
    )

    VoiceApp.becameFloor(
      liveMeeting,
      outGW,
      msg.body.voiceUserId,
      msg.body.floorTimestamp
    )
  }
}
