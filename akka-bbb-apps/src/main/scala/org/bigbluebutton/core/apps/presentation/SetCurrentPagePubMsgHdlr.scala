package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core.models.Users2x

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

    if (Users2x.isPresenter(msg.header.userId, liveMeeting.users2x)) {
      if (setCurrentPage(msg.body.presentationId, msg.body.pageId)) {
        broadcastEvent(msg)
      }
    }
  }
}
