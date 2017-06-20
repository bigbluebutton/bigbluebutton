package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.messages.{ GetWebcamStreamsMeetingRespMsg, _ }

object GetWebcamStreamsMeetingRespMsgBuilder {
  def build(meetingId: String, userId: String, streams: Vector[WebcamStreamVO]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetWebcamStreamsMeetingRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetWebcamStreamsMeetingRespMsg.NAME, meetingId, userId)

    val body = GetWebcamStreamsMeetingRespMsgBody(streams)
    val event = GetWebcamStreamsMeetingRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
