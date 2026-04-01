package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.SharedNotesDAO
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait BNSharedNotesCreatedEvtMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: BNSharedNotesCreatedEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(externalId: String, userId: String, padId: String, name: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(PadCreatedRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PadCreatedRespMsg.NAME, liveMeeting.props.meetingProp.intId, userId)
      val body = PadCreatedRespMsgBody(externalId, padId, name, "blockNote")
      val event = PadCreatedRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    // Create group
    Pads.setGroupId(liveMeeting.pads, msg.body.externalId, "default")

    Pads.setPadId(liveMeeting.pads, msg.body.externalId, msg.body.padId)
    SharedNotesDAO.insert(liveMeeting.props.meetingProp.intId, msg.body.externalId, msg.body.model,
      msg.body.padId, msg.body.externalId, liveMeeting.props.meetingProp.sharedNotesEditor)
    broadcastEvent(msg.body.externalId, "SYSTEM", msg.body.padId, msg.body.externalId)
  }
}

