package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadUpdatedSysMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadUpdatedSysMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(externalId: String, padId: String, userId: String, rev: Int, changeset: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadUpdatedEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadUpdatedEvtMsgBody(externalId, padId, userId, rev, changeset)
      val event = PadUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    Pads.getGroupById(liveMeeting.pads, msg.body.groupId) match {
      case Some(group) => broadcastEvent(group.externalId, msg.body.padId, msg.body.userId, msg.body.rev, msg.body.changeset)
      case _           =>
    }
  }
}
