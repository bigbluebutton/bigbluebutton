package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.msgs._

object GetVoiceUsersMeetingRespMsgBuilder {
  def build(meetingId: String, userId: String, voiceUsers: Vector[VoiceConfUser]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetVoiceUsersMeetingRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetVoiceUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetVoiceUsersMeetingRespMsgBody(voiceUsers)
    val event = GetVoiceUsersMeetingRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
