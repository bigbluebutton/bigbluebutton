package org.bigbluebutton.core.apps.caption

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait SendCaptionHistoryReqMsgHdlr {
  this: CaptionApp2x =>

  val outGW: OutMsgRouter

  def handleSendCaptionHistoryReqMsg(msg: SendCaptionHistoryReqMsg): Unit = {

    def broadcastEvent(msg: SendCaptionHistoryReqMsg, history: Map[String, TranscriptVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendCaptionHistoryRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendCaptionHistoryRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendCaptionHistoryRespMsgBody(history)
      val event = SendCaptionHistoryRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(msg, getCaptionHistory())
  }
}
