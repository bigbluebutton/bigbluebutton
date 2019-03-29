package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

object VoiceApp {

  def genRecordPath(recordDir: String, meetingId: String, timestamp: Long): String = {
    if (recordDir.endsWith("/")) {
      recordDir.concat(meetingId).concat("-").concat(timestamp.toString).concat(".wav")
    } else {
      recordDir.concat("/").concat(meetingId).concat("-").concat(timestamp.toString).concat(".wav")
    }
  }

  def startRecordingVoiceConference(liveMeeting: LiveMeeting, outGW: OutMsgRouter, stream: String): Unit = {
    MeetingStatus2x.voiceRecordingStart(liveMeeting.status, stream)
    val event = MsgBuilder.buildStartRecordingVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      stream
    )
    outGW.send(event)
  }

  def stopRecordingVoiceConference(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {

    val recStreams = MeetingStatus2x.getVoiceRecordingStreams(liveMeeting.status)

    recStreams foreach { rs =>
      val event = MsgBuilder.buildStopRecordingVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf, rs.stream
      )
      outGW.send(event)
    }

  }
}
