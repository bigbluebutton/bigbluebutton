package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait GetCurrentLayoutMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetCurrentLayoutMsg(msg: GetCurrentLayoutMsg): Unit = {

    def broadcastEvent(msg: GetCurrentLayoutMsg): Unit = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, msg.header.userId)
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
