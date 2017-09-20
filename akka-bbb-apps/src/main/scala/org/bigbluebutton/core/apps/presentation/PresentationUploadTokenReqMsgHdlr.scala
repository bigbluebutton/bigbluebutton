package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationUploadTokenReqMsgHdlr {
  this: PresentationApp2x =>

  def handle(
    msg:         PresentationUploadTokenReqMsg,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): Unit = {

    // TODO move these in Pods
    def generateToken(podId: String, userId: String): String = {
      "LALA-" + podId + "-" + userId
    }

    def userIsAllowedToUploadInPod(podId: String, userId: String): Boolean = {
      true
    }

    def handlePresentationUploadTokenReqMsg(msg: PresentationUploadTokenReqMsg): Unit = {
      log.info("handlePresentationUploadTokenReqMsg" + liveMeeting.props.meetingProp.intId +
        " userId=" + msg.header.userId + " filename=" + msg.body.filename)

      /* for {
        // pod <- findPodWithId(msg.body.podId)
        token <- generateToken(msg.body.podId, msg.header.userId)
      } yield {
        broadcastEvent(msg, token)
      } */

      if (userIsAllowedToUploadInPod(msg.body.podId, msg.header.userId)) {
        val token = generateToken(msg.body.podId, msg.header.userId)
        broadcastPresentationUploadTokenPassResp(msg, token)
        broadcastPresentationUploadTokenSysPubMsg(msg, token)
      } else {
        broadcastPresentationUploadTokenFailResp(msg)
      }

    }

    handlePresentationUploadTokenReqMsg(msg)

    // helpers
    def broadcastPresentationUploadTokenPassResp(msg: PresentationUploadTokenReqMsg, token: String): Unit = {
      // send back to client
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationUploadTokenPassRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenPassRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenPassRespMsgBody(msg.body.podId, token, msg.body.filename)
      val event = PresentationUploadTokenPassRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastPresentationUploadTokenFailResp(msg: PresentationUploadTokenReqMsg): Unit = {
      // send back to client
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationUploadTokenFailRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenFailRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenFailRespMsgBody(msg.body.podId, msg.body.filename)
      val event = PresentationUploadTokenFailRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastPresentationUploadTokenSysPubMsg(msg: PresentationUploadTokenReqMsg, token: String): Unit = {
      // send to bbb-web
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PresentationUploadTokenSysPubMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenSysPubMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenSysPubMsgBody(msg.body.podId, token, msg.body.filename)
      val event = PresentationUploadTokenSysPubMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }
  }

}
