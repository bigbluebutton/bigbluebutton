package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages.MessageBody.PresentationConversionCompletedEvtMsgBody
import org.bigbluebutton.common2.messages._

trait PresentationConversionCompletedPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMessageGateway

  def handlePresentationConversionCompletedPubMsg(msg: PresentationConversionCompletedPubMsg): Unit = {

    def broadcastEvent(msg: PresentationConversionCompletedPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationConversionCompletedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationConversionCompletedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationConversionCompletedEvtMsgBody(msg.body.messageKey, msg.body.code, msg.body.presentation)
      val event = PresentationConversionCompletedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    presentationConversionCompleted(msg.body.presentation)
    broadcastEvent(msg)
  }
}