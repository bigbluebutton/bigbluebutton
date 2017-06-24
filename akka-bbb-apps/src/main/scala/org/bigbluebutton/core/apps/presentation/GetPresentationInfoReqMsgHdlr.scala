package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages.MessageBody.GetPresentationInfoRespMsgBody
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.domain.PresentationVO

trait GetPresentationInfoReqMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMessageGateway

  def handleGetPresentationInfoReqMsg(msg: GetPresentationInfoReqMsg): Unit = {

    def broadcastEvent(msg: GetPresentationInfoReqMsg, presentations: Seq[PresentationVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetPresentationInfoRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetPresentationInfoRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = GetPresentationInfoRespMsgBody(presentations)
      val event = GetPresentationInfoRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    broadcastEvent(msg, getPresentationInfo())
  }
}