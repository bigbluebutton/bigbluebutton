package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.messages.Presentation.{ RemovePresentationEvtMsg, RemovePresentationEvtMsgBody, RemovePresentationPubMsg }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages._

trait RemovePresentationPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMessageGateway

  def handleRemovePresentationPubMsg(msg: RemovePresentationPubMsg): Unit = {

    def broadcastEvent(msg: RemovePresentationPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(RemovePresentationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(RemovePresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = RemovePresentationEvtMsgBody(msg.body.presentationId)
      val event = RemovePresentationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    for {
      presentation <- removePresentation(msg.body.presentationId)
    } yield {
      broadcastEvent(msg)
    }
  }
}