package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait PresentationUploadTokenReqMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  // TODO move these in Pods
  def generateToken(podId: String, userId: String): String = {
    "LALA-" + podId + "-" + userId
  }

  def userIsAllowedToUploadInPod(podId: String, userId: String): Boolean = {
    true
  }

  def handlePresentationUploadTokenReqMsg(msg: PresentationUploadTokenReqMsg): Unit = {
    log.info(" ____ handlePresentationUploadTokenReqMsg" + liveMeeting.props.meetingProp.intId +
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
    } else {
      broadcastPresentationUploadTokenFailResp(msg)
    }

  }

  private def broadcastPresentationUploadTokenPassResp(msg: PresentationUploadTokenReqMsg, token: String): Unit = {
    // send back to client
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
    val envelope = BbbCoreEnvelope(PresentationUploadTokenPassRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadTokenPassRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

    val body = PresentationUploadTokenPassRespMsgBody(msg.body.podId, token, msg.body.filename)
    val event = PresentationUploadTokenPassRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)

    // send to bbb-web

  }

  private def broadcastPresentationUploadTokenFailResp(msg: PresentationUploadTokenReqMsg): Unit = {
    // send back to client
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
    val envelope = BbbCoreEnvelope(PresentationUploadTokenFailRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadTokenFailRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

    val body = PresentationUploadTokenFailRespMsgBody(msg.body.podId, msg.body.filename)
    val event = PresentationUploadTokenFailRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)

    // send to bbb-web

  }
}
