package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadCreatedEvtMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadCreatedEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(externalId: String, userId: String, padId: String, name: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(PadCreatedRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PadCreatedRespMsg.NAME, liveMeeting.props.meetingProp.intId, userId)
      val body = PadCreatedRespMsgBody(externalId, padId, name)
      val event = PadCreatedRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    Pads.getGroupById(liveMeeting.pads, msg.body.groupId) match {
      case Some(group) => broadcastEvent(group.externalId, group.userId, msg.body.padId, msg.body.name)
      case _           =>
    }
  }
}
