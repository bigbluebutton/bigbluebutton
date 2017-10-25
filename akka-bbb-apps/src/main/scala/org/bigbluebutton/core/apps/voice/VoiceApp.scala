package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

object VoiceApp {

  def startRecordingVoiceConference(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    MeetingStatus2x.startRecordingVoice(liveMeeting.status)
    val event = MsgBuilder.buildStartRecordingVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf
    )
    outGW.send(event)
  }

  def stopRecordingVoiceConference(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    MeetingStatus2x.stopRecordingVoice(liveMeeting.status)

    val event = MsgBuilder.buildStopRecordingVoiceConfSysMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf, MeetingStatus2x.getVoiceRecordingFilename(liveMeeting.status)
    )
    outGW.send(event)
  }
}
