package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Layouts }
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait BroadcastPushLayoutMsgHdlr extends RightsManagementTrait {
  this: LayoutApp2x =>

  val outGW: OutMsgRouter

  def handleBroadcastPushLayoutMsg(msg: BroadcastPushLayoutMsg): Unit = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to broadcast pushLayout to meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {

      Layouts.setPushLayout(liveMeeting.layouts, msg.body.pushLayout)
      Layouts.setRequestedBy(liveMeeting.layouts, msg.header.userId)

      sendBroadcastPushLayoutEvtMsg(msg.header.userId)
    }
  }

  def sendBroadcastPushLayoutEvtMsg(fromUserId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, fromUserId)
    val envelope = BbbCoreEnvelope(BroadcastPushLayoutEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(BroadcastPushLayoutEvtMsg.NAME, liveMeeting.props.meetingProp.intId, fromUserId)

    val body = BroadcastPushLayoutEvtMsgBody(
      Layouts.getPushLayout(liveMeeting.layouts),
      Layouts.getLayoutSetter(liveMeeting.layouts),
    )
    val event = BroadcastPushLayoutEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }
}
