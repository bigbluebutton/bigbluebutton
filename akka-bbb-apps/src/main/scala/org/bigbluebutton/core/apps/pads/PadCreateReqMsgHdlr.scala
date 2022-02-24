package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadCreateReqMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadCreateReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(groupId: String, name: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadCreateCmdMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadCreateCmdMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadCreateCmdMsgBody(groupId, name)
      val event = PadCreateCmdMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    Pads.getGroup(liveMeeting.pads, msg.body.externalId) match {
      case Some(group) => {
        if (group.userId == msg.header.userId) broadcastEvent(group.groupId, msg.body.name)
      }
      case _ =>
    }
  }
}
