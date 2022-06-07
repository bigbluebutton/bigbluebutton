package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait RecordingStartedVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRecordingStartedVoiceConfEvtMsg(msg: RecordingStartedVoiceConfEvtMsg) {
    if (msg.body.recording) {
      MeetingStatus2x.voiceRecordingStarted(liveMeeting.status, msg.body.stream)

      def buildVoiceRecordingStartedEvtMsg(meetingId: String, stream: String, timestamp: String,
                                           voiceConf: String): BbbCommonEnvCoreMsg = {
        val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
        val envelope = BbbCoreEnvelope(VoiceRecordingStartedEvtMsg.NAME, routing)

        val body = VoiceRecordingStartedEvtMsgBody(meetingId, stream, timestamp, voiceConf)
        val header = BbbClientMsgHeader(VoiceRecordingStartedEvtMsg.NAME, meetingId, "not-used")
        val event = VoiceRecordingStartedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildVoiceRecordingStartedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.stream,
        msg.body.timestamp, liveMeeting.props.voiceProp.voiceConf)
      outGW.send(event)
    } else {
      MeetingStatus2x.voiceRecordingStopped(liveMeeting.status, msg.body.stream)

      def buildVoiceRecordingStoppedEvtMsg(meetingId: String, stream: String, timestamp: String,
                                           voiceConf: String): BbbCommonEnvCoreMsg = {
        val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
        val envelope = BbbCoreEnvelope(VoiceRecordingStoppedEvtMsg.NAME, routing)

        val body = VoiceRecordingStoppedEvtMsgBody(meetingId, stream, timestamp, voiceConf)
        val header = BbbClientMsgHeader(VoiceRecordingStoppedEvtMsg.NAME, meetingId, "not-used")
        val event = VoiceRecordingStoppedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildVoiceRecordingStoppedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.stream,
        msg.body.timestamp, liveMeeting.props.voiceProp.voiceConf)
      outGW.send(event)
    }
  }

}
