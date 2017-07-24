package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait PresentationPageGeneratedPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  def handlePresentationPageGeneratedPubMsg(msg: PresentationPageGeneratedSysPubMsg): Unit = {

    def broadcastEvent(msg: PresentationPageGeneratedSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationPageGeneratedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationPageGeneratedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationPageGeneratedEvtMsgBody(msg.body.messageKey, msg.body.code, msg.body.presentationId, msg.body.numberOfPages, msg.body.pagesCompleted, msg.body.presName)
      val event = PresentationPageGeneratedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    broadcastEvent(msg)
  }
}
