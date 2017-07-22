package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait PresentationConversionUpdatePubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  def handlePresentationConversionUpdatePubMsg(msg: PresentationConversionUpdateSysPubMsg): Unit = {

    def broadcastEvent(msg: PresentationConversionUpdateSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationConversionUpdateEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationConversionUpdateEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationConversionUpdateEvtMsgBody(msg.body.messageKey, msg.body.code, msg.body.presentationId, msg.body.presName)
      val event = PresentationConversionUpdateEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(msg)
  }
}
