package org.bigbluebutton.core2.message.handlers.layout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Layouts

trait GetCurrentLayoutReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetCurrentLayoutReqMsg(msg: GetCurrentLayoutReqMsg): Unit = {

    def broadcastEvent(msg: GetCurrentLayoutReqMsg): Unit = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetCurrentLayoutRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetCurrentLayoutRespMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = GetCurrentLayoutRespMsgBody(Layouts.getCurrentLayout(),
        MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
        Layouts.getLayoutSetter())
      val event = GetCurrentLayoutRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    broadcastEvent(msg)
  }
}
