package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs.VoiceConfRunningEvtMsg
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil

trait VoiceConfRunningEvtMsgHdlr extends SystemConfiguration {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleVoiceConfRunningEvtMsg(msg: VoiceConfRunningEvtMsg): Unit = {
    log.info("Received VoiceConfRunningEvtMsg " + msg.body.running)

    if (liveMeeting.props.recordProp.record) {
      if (msg.body.running) {
        val meetingId = liveMeeting.props.meetingProp.intId
        val recordFile = VoiceApp.genRecordPath(
          voiceConfRecordPath,
          meetingId,
          TimeUtil.timeNowInMs(),
          voiceConfRecordCodec
        )
        log.info("Send START RECORDING voice conf. meetingId=" + meetingId + " voice conf=" + liveMeeting.props.voiceProp.voiceConf)

        VoiceApp.startRecordingVoiceConference(liveMeeting, outGW, recordFile)
      } else {
        VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)
      }
    }
  }
}
