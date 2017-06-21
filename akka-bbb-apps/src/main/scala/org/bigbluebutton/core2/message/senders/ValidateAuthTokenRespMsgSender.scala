package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.users.{ ValidateAuthTokenRespMsg, ValidateAuthTokenRespMsgBody }
import org.bigbluebutton.core.OutMessageGateway

object ValidateAuthTokenRespMsgSender {

  def send(outGW: OutMessageGateway, meetingId: String, userId: String, authToken: String, valid: Boolean): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(ValidateAuthTokenRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(ValidateAuthTokenRespMsg.NAME, meetingId, userId)
    val body = ValidateAuthTokenRespMsgBody(userId, authToken, valid)
    val event = ValidateAuthTokenRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
