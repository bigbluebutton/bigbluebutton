package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait GetMicrophonePermissionReqMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetMicrophonePermissionReqMsg(msg: GetMicrophonePermissionReqMsg): Unit = {

    def broadcastEvent(
        meetingId:    String,
        voiceConf:    String,
        userId:       String,
        sfuSessionId: String,
        allowed:      Boolean,
        muteOnStart:  Boolean
    ): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetMicrophonePermissionRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetMicrophonePermissionRespMsg.NAME, meetingId, userId)
      val body = GetMicrophonePermissionRespMsgBody(
        meetingId,
        voiceConf,
        userId,
        sfuSessionId,
        allowed,
        muteOnStart
      )
      val event = GetMicrophonePermissionRespMsg(header, body)
      val eventMsg = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(eventMsg)
    }

    val allowed = VoiceHdlrHelpers.isMicrophoneSharingAllowed(
      liveMeeting,
      msg.body.meetingId,
      msg.body.userId,
      msg.body.voiceConf,
      msg.body.callerIdNum
    )
    // Lock settings should only define whether the user starts muted or not.
    // It must not prevent users from joining audio.
    val locked = VoiceHdlrHelpers.isMicrophoneSharingLocked(liveMeeting, msg.body.userId)
    val muteOnStart = MeetingStatus2x.isMeetingMuted(liveMeeting.status) || locked

    broadcastEvent(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      msg.body.userId,
      msg.body.sfuSessionId,
      allowed,
      muteOnStart
    )
  }
}
