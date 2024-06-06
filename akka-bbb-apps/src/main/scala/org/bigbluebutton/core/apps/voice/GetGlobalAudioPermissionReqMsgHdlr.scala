package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }

trait GetGlobalAudioPermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetGlobalAudioPermissionReqMsg(msg: GetGlobalAudioPermissionReqMsg): Unit = {

    def broadcastEvent(
        meetingId:    String,
        voiceConf:    String,
        userId:       String,
        sfuSessionId: String,
        allowed:      Boolean
    ): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetGlobalAudioPermissionRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetGlobalAudioPermissionRespMsg.NAME, meetingId, userId)
      val body = GetGlobalAudioPermissionRespMsgBody(
        meetingId,
        voiceConf,
        userId,
        sfuSessionId,
        allowed
      )
      val event = GetGlobalAudioPermissionRespMsg(header, body)
      val eventMsg = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(eventMsg)
    }

    val allowed = VoiceHdlrHelpers.isGlobalAudioSubscribeAllowed(
      liveMeeting,
      msg.body.meetingId,
      msg.body.userId,
      msg.body.voiceConf
    )

    broadcastEvent(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      msg.body.userId,
      msg.body.sfuSessionId,
      allowed
    )
  }
}
