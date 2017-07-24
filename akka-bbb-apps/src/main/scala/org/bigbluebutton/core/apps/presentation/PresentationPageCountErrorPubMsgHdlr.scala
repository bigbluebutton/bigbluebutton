package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait PresentationPageCountErrorPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  def handlePresentationPageCountErrorPubMsg(msg: PresentationPageCountErrorSysPubMsg): Unit = {

    def broadcastEvent(msg: PresentationPageCountErrorSysPubMsg): Unit = {
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
