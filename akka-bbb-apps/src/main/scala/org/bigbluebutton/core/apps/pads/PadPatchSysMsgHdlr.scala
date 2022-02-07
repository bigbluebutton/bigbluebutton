package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadPatchSysMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadPatchSysMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEditCaptionHistoryEvent(userId: String, start: Int, end: Int, name: String, locale: String, text: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(EditCaptionHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(EditCaptionHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)
      val body = EditCaptionHistoryEvtMsgBody(start, end, name, locale, text)
      val event = EditCaptionHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    def broadcastPadTailEvent(externalId: String, tail: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadTailEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadTailEvtMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadTailEvtMsgBody(externalId, tail)
      val event = PadTailEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    Pads.getGroupById(liveMeeting.pads, msg.body.groupId) match {
      case Some(group) => {
        val success = liveMeeting.captionModel.editHistory(msg.body.userId, msg.body.start, msg.body.end, group.name, msg.body.text)
        if (success) {
          val locale = liveMeeting.captionModel.getLocale(group.name)
          broadcastEditCaptionHistoryEvent(msg.body.userId, msg.body.start, msg.body.end, group.name, locale, msg.body.text)
          val tail = liveMeeting.captionModel.getTextTail(group.name)
          broadcastPadTailEvent(group.externalId, tail)
        }
      }
      case _ =>
    }
  }
}
