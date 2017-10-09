//package org.bigbluebutton.core.apps.presentation
//
//import org.bigbluebutton.common2.msgs._
//import org.bigbluebutton.common2.domain.PresentationVO
//import org.bigbluebutton.core.apps.Presentation
//import org.bigbluebutton.core.bus.MessageBus
//import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
//
//trait GetPresentationInfoReqMsgHdlr {
//  this: PresentationApp2x =>
//
//  def handle(
//    msg:         GetPresentationInfoReqMsg,
//    liveMeeting: LiveMeeting, bus: MessageBus
//  ): Unit = {
//    log.debug("Received GetPresentationInfoReqMsg")
//
//    def broadcastEvent(msg: GetPresentationInfoReqMsg, presentations: Vector[Presentation]): Unit = {
//      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
//      val envelope = BbbCoreEnvelope(GetPresentationInfoRespMsg.NAME, routing)
//      val header = BbbClientMsgHeader(GetPresentationInfoRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
//
//      val presVOs = presentations.map { p =>
//        PresentationVO(p.id, p.name, p.current, p.pages.values.toVector, p.downloadable)
//      }
//
//      val body = GetPresentationInfoRespMsgBody(presVOs)
//      val event = GetPresentationInfoRespMsg(header, body)
//      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
//      bus.outGW.send(msgEvent)
//    }
//
//    broadcastEvent(msg, getPresentationInfo(liveMeeting)) //
//  }
//}
