package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadUpdatePubMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadUpdatePubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(groupId: String, name: String, text: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadUpdateCmdMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadUpdateCmdMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadUpdateCmdMsgBody(groupId, name, text)
      val event = PadUpdateCmdMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    if (Pads.hasAccess(liveMeeting, msg.body.externalId, msg.header.userId)) {
      Pads.getGroup(liveMeeting.pads, msg.body.externalId) match {
        case Some(group) => broadcastEvent(group.groupId, msg.body.externalId, msg.body.text)
        case _           =>
      }
    }
  }
}
