package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.domain.PageVO
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait ResizeAndMovePagePubMsgHdlr {
  this: PresentationApp2x =>

  def handle(
    msg:         ResizeAndMovePagePubMsg,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): Unit = {

    def broadcastEvent(msg: ResizeAndMovePagePubMsg, page: PageVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ResizeAndMovePageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ResizeAndMovePageEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ResizeAndMovePageEvtMsgBody(msg.body.presentationId, page.id, page.xOffset, page.yOffset, page.widthRatio, page.heightRatio)
      val event = ResizeAndMovePageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      page <- resizeAndMovePage(liveMeeting, msg.body.presentationId, msg.body.pageId,
        msg.body.xOffset, msg.body.yOffset, msg.body.widthRatio, msg.body.heightRatio)
    } yield {
      broadcastEvent(msg, page)
    }
  }
}
