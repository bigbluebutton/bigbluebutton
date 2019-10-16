package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait PdfConversionInvalidErrorSysPubMsgHdlr {
    this: PresentationPodHdlrs =>

  def handle(
      msg: PdfConversionInvalidErrorSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastEvent(msg: PdfConversionInvalidErrorSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PdfConversionInvalidErrorSysPubMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PdfConversionInvalidErrorSysPubMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PdfConversionInvalidErrorSysPubMsgBody(msg.body.podId, msg.body.messageKey, msg.body.code, msg.body.presentationId, msg.body.bigPageNumber, msg.body.bigPageSize, msg.body.presName)
      val event = PdfConversionInvalidErrorSysPubMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg)
    state
  }
}
