package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core2.MeetingStatus2x

trait BroadcastLayoutMsgHdlr {
  this: LayoutApp2x =>

  val outGW: OutMessageGateway

  def handleBroadcastLayoutMsg(msg: BroadcastLayoutMsg): Unit = {
    Layouts.setCurrentLayout(msg.body.layout)

    sendBroadcastLayoutEvtMsg(msg.header.userId)
  }

  def sendBroadcastLayoutEvtMsg(fromUserId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, fromUserId)
    val envelope = BbbCoreEnvelope(BroadcastLayoutEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(BroadcastLayoutEvtMsg.NAME, liveMeeting.props.meetingProp.intId, fromUserId)

    val body = BroadcastLayoutEvtMsgBody(
      Layouts.getCurrentLayout(),
      MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
      Layouts.getLayoutSetter(), affectedUsers
    )
    val event = BroadcastLayoutEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }
}
