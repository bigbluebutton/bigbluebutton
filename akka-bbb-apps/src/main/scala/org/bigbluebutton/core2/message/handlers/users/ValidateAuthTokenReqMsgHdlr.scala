package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages.MessageBody.ValidateAuthTokenRespMsgBody
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.ValidateAuthToken
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.MeetingActor

trait ValidateAuthTokenReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg): Unit = {
    log.debug("****** RECEIVED ValidateAuthTokenReqMsg msg {}", msg)

    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, msg.body.userId)
    val envelope = BbbCoreEnvelope(ValidateAuthTokenRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(ValidateAuthTokenRespMsg.NAME, props.meetingProp.intId, msg.body.userId)

    RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers) match {
      case Some(u) =>
        log.info("ValidateToken success. meetingId=" + props.meetingProp.intId + " userId=" + msg.body.userId)

        val body = ValidateAuthTokenRespMsgBody(msg.body.userId, msg.body.authToken, true)
        val event = ValidateAuthTokenRespMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)

        sendOldValidateToken(props.meetingProp.intId, msg.body.userId, msg.body.authToken)
      case None =>
        log.info("ValidateToken failed. meetingId=" + props.meetingProp.intId + " userId=" + msg.body.userId)
        val body = ValidateAuthTokenRespMsgBody(msg.body.userId, msg.body.authToken, false)
        val event = ValidateAuthTokenRespMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)
    }
  }

  def sendOldValidateToken(meetingId: String, userId: String, authToken: String): Unit = {
    handleValidateAuthToken(ValidateAuthToken(meetingID = meetingId, userId = userId, token = authToken,
      correlationId = authToken, sessionId = authToken))
  }
}
