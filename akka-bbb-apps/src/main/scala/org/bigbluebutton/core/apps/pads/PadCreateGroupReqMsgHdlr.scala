package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadCreateGroupReqMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: PadCreateGroupReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(externalId: String, model: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadCreateGroupCmdMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(PadCreateGroupCmdMsg.NAME, liveMeeting.props.meetingProp.intId)
      val body = PadCreateGroupCmdMsgBody(externalId, model)
      val event = PadCreateGroupCmdMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val padEnabled = msg.body.model match {
      case "notes"    => !liveMeeting.props.meetingProp.disabledFeatures.contains("sharedNotes")
      case "captions" => !liveMeeting.props.meetingProp.disabledFeatures.contains("captions")
      case _          => false
    }

    if (padEnabled && !Pads.hasGroup(liveMeeting.pads, msg.body.externalId)) {
      Pads.addGroup(liveMeeting.pads, msg.body.externalId, msg.body.model, msg.body.name, msg.header.userId)
      broadcastEvent(msg.body.externalId, msg.body.model)
    }
  }
}
