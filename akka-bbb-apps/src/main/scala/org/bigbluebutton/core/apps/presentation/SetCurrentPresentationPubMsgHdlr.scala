package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait SetCurrentPresentationPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  def handleSetCurrentPresentationPubMsg(msg: SetCurrentPresentationPubMsg): Unit = {

    def broadcastEvent(msg: SetCurrentPresentationPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SetCurrentPresentationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetCurrentPresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SetCurrentPresentationEvtMsgBody(msg.body.presentationId)
      val event = SetCurrentPresentationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      presentation <- setCurrentPresentation(msg.body.presentationId)
    } yield {
      broadcastEvent(msg)
    }
  }
}
