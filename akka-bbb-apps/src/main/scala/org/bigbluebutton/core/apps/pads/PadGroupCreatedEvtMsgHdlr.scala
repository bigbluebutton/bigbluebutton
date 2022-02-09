package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadGroupCreatedEvtMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadGroupCreatedEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(externalId: String, model: String, name: String, userId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(PadGroupCreatedRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PadGroupCreatedRespMsg.NAME, liveMeeting.props.meetingProp.intId, userId)
      val body = PadGroupCreatedRespMsgBody(externalId, model, name)
      val event = PadGroupCreatedRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    Pads.getGroup(liveMeeting.pads, msg.body.externalId) match {
      case Some(group) => {
        Pads.setGroupId(liveMeeting.pads, msg.body.externalId, msg.body.groupId)
        broadcastEvent(msg.body.externalId, group.model, group.name, group.userId)
      }
      case _ =>
    }
  }
}
