package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadSessionDeletedSysMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadSessionDeletedSysMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(externalId: String, userId: String, sessionId: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadSessionDeletedEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadSessionDeletedEvtMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadSessionDeletedEvtMsgBody(externalId, userId, sessionId)
      val event = PadSessionDeletedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    Pads.getGroupById(liveMeeting.pads, msg.body.groupId) match {
      case Some(group) => broadcastEvent(group.externalId, msg.body.userId, msg.body.sessionId)
      case _           =>
    }
  }
}
