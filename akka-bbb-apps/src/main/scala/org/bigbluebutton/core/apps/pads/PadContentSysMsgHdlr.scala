package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadContentSysMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadContentSysMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(externalId: String, padId: String, rev: String, start: Int, end: Int, text: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadContentEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadContentEvtMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadContentEvtMsgBody(externalId, padId, rev, start, end, text)
      val event = PadContentEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    Pads.getGroupById(liveMeeting.pads, msg.body.groupId) match {
      case Some(group) => broadcastEvent(group.externalId, msg.body.padId, msg.body.rev, msg.body.start, msg.body.end, msg.body.text)
      case _           =>
    }
  }
}
