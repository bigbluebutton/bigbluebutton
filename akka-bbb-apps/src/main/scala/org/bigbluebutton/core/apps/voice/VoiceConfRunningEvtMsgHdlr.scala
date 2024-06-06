package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs.VoiceConfRunningEvtMsg
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.apps.voice.VoiceApp

trait VoiceConfRunningEvtMsgHdlr extends SystemConfiguration {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleVoiceConfRunningEvtMsg(msg: VoiceConfRunningEvtMsg): Unit = {
    log.info("Received VoiceConfRunningEvtMsg " + msg.body.running)

    if (liveMeeting.props.recordProp.record) {
      if (msg.body.running &&
        (MeetingStatus2x.isRecording(liveMeeting.status) || liveMeeting.props.recordProp.recordFullDurationMedia)) {
        val meetingId = liveMeeting.props.meetingProp.intId
        log.info("Send START RECORDING voice conf. meetingId=" + meetingId + " voice conf=" + liveMeeting.props.voiceProp.voiceConf)

        VoiceApp.startRecordingVoiceConference(liveMeeting, outGW)
      } else {
        VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)
      }
    }
  }
}
