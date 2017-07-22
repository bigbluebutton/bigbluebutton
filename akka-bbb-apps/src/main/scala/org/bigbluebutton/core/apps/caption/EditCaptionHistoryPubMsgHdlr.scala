package org.bigbluebutton.core.apps.caption

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait EditCaptionHistoryPubMsgHdlr {
  this: CaptionApp2x =>

  val outGW: OutMsgRouter

  def handleEditCaptionHistoryPubMsg(msg: EditCaptionHistoryPubMsg): Unit = {

    def broadcastEvent(msg: EditCaptionHistoryPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(EditCaptionHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(EditCaptionHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = EditCaptionHistoryEvtMsgBody(msg.body.startIndex, msg.body.endIndex, msg.body.locale, msg.body.localeCode, msg.body.text)
      val event = EditCaptionHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      //record(event)
    }

    val successfulEdit = editCaptionHistory(msg.header.userId, msg.body.startIndex, msg.body.endIndex, msg.body.locale, msg.body.text)
    if (successfulEdit) {
      broadcastEvent(msg)
    }
  }
}
