package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait RemovePresentationPubMsgHdlr {
  this: PresentationApp2x =>

  def handle(
    msg:         RemovePresentationPubMsg,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): Unit = {

    def broadcastEvent(msg: RemovePresentationPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(RemovePresentationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(RemovePresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = RemovePresentationEvtMsgBody(msg.body.presentationId)
      val event = RemovePresentationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      presentation <- removePresentation(liveMeeting, msg.body.presentationId)
    } yield {
      broadcastEvent(msg)
    }
  }
}
