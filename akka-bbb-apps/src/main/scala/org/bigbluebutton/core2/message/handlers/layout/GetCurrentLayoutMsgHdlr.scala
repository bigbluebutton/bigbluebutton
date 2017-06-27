package org.bigbluebutton.core2.message.handlers.layout

import org.bigbluebutton.common2.messages.Routing
import org.bigbluebutton.common2.messages.MessageTypes
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.common2.messages.BbbCommonEnvCoreMsg
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.common2.messages.BbbClientMsgHeader
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.common2.messages.BbbCoreEnvelope
import org.bigbluebutton.common2.messages.Layout.{ GetCurrentLayoutEvtMsg, GetCurrentLayoutEvtMsgBody, GetCurrentLayoutMsg }

trait GetCurrentLayoutMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetCurrentLayoutMsg(msg: GetCurrentLayoutMsg): Unit = {

    def broadcastEvent(msg: GetCurrentLayoutMsg): Unit = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetCurrentLayoutEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetCurrentLayoutEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = GetCurrentLayoutEvtMsgBody(msg.body.meetingId, props.recordProp.record, msg.body.requesterId,
        Layouts.getCurrentLayout(),
        MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
        Layouts.getLayoutSetter())
      val event = GetCurrentLayoutEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    broadcastEvent(msg)
  }
}
