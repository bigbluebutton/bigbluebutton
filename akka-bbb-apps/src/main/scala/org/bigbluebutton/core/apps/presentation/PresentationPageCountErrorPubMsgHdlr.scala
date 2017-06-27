package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.messages.Presentation.{ PresentationPageCountErrorEvtMsg, PresentationPageCountErrorEvtMsgBody, PresentationPageCountErrorPubMsg }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages._

trait PresentationPageCountErrorPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMessageGateway

  def handlePresentationPageCountErrorPubMsg(msg: PresentationPageCountErrorPubMsg): Unit = {

    def broadcastEvent(msg: PresentationPageCountErrorPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationPageCountErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationPageCountErrorEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationPageCountErrorEvtMsgBody(msg.body.messageKey, msg.body.code, msg.body.presentationId, msg.body.numberOfPages, msg.body.maxNumberPages, msg.body.presName)
      val event = PresentationPageCountErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(msg)
  }
}