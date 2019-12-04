package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait BroadcastLayoutMsgHdlr extends RightsManagementTrait {
  this: LayoutApp2x =>

  val outGW: OutMsgRouter

  def handleBroadcastLayoutMsg(msg: BroadcastLayoutMsg): Unit = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to broadcast layout to meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      Layouts.setCurrentLayout(liveMeeting.layouts, msg.body.layout, msg.header.userId)

      sendBroadcastLayoutEvtMsg(msg.header.userId)
    }
  }

  def sendBroadcastLayoutEvtMsg(fromUserId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, fromUserId)
    val envelope = BbbCoreEnvelope(BroadcastLayoutEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(BroadcastLayoutEvtMsg.NAME, liveMeeting.props.meetingProp.intId, fromUserId)

    val body = BroadcastLayoutEvtMsgBody(
      Layouts.getCurrentLayout(liveMeeting.layouts),
      MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
      Layouts.getLayoutSetter(liveMeeting.layouts), affectedUsers
    )
    val event = BroadcastLayoutEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }
}
