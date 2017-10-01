//package org.bigbluebutton.core.apps.presentation
//
//import org.bigbluebutton.common2.msgs._
//import org.bigbluebutton.core.bus.MessageBus
//import org.bigbluebutton.core.running.LiveMeeting
//
//trait SetCurrentPresentationPubMsgHdlr {
//  this: PresentationApp2x =>
//
//  def handle(
//    msg:         SetCurrentPresentationPubMsg,
//    liveMeeting: LiveMeeting, bus: MessageBus
//  ): Unit = {
//
//    def broadcastEvent(msg: SetCurrentPresentationPubMsg): Unit = {
//      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
//      val envelope = BbbCoreEnvelope(SetCurrentPresentationEvtMsg.NAME, routing)
//      val header = BbbClientMsgHeader(SetCurrentPresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
//
//      val body = SetCurrentPresentationEvtMsgBody(msg.body.podId, msg.body.presentationId)
//      val event = SetCurrentPresentationEvtMsg(header, body)
//      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
//      bus.outGW.send(msgEvent)
//    }
//
//    for {
////      pod <- getPr
//      presentation <- setCurrentPresentation(liveMeeting, msg.body.presentationId)
//    } yield {
//      broadcastEvent(msg)
//    }
//  }
//}
