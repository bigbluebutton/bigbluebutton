package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait SetCurrentPagePubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  def handleSetCurrentPagePubMsg(msg: SetCurrentPagePubMsg): Unit = {

    def broadcastEvent(msg: SetCurrentPagePubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SetCurrentPageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetCurrentPageEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SetCurrentPageEvtMsgBody(msg.body.presentationId, msg.body.pageId)
      val event = SetCurrentPageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    if (setCurrentPage(msg.body.presentationId, msg.body.pageId)) {
      broadcastEvent(msg)
    }
  }
}
