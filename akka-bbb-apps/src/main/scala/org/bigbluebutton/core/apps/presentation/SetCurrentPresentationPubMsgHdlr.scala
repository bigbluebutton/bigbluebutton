package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages.MessageBody.SetCurrentPresentationEvtMsgBody
import org.bigbluebutton.common2.messages._

trait SetCurrentPresentationPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMessageGateway

  def handleSetCurrentPresentationPubMsg(msg: SetCurrentPresentationPubMsg): Unit = {

    def broadcastEvent(msg: SetCurrentPresentationPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SetCurrentPresentationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetCurrentPresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SetCurrentPresentationEvtMsgBody(msg.body.presentationId)
      val event = SetCurrentPresentationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    for {
      presentation <- setCurrentPresentation(msg.body.presentationId)
    } yield {
      broadcastEvent(msg)
    }
  }
}