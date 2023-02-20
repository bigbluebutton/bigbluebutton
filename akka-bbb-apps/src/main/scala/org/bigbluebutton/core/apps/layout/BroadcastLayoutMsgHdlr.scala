package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Layouts, LayoutsType }
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait BroadcastLayoutMsgHdlr extends RightsManagementTrait {
  this: LayoutApp2x =>

  val outGW: OutMsgRouter

  def handleBroadcastLayoutMsg(msg: BroadcastLayoutMsg): Unit = {

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("layouts")) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "Layouts is disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to broadcast layout to meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      if (LayoutsType.layoutsType.contains(msg.body.layout)) {
        val newlayout = LayoutsType.layoutsType.getOrElse(msg.body.layout, "")

        Layouts.setCurrentLayout(liveMeeting.layouts, newlayout)
        Layouts.setPushLayout(liveMeeting.layouts, msg.body.pushLayout)
        Layouts.setPresentationIsOpen(liveMeeting.layouts, msg.body.presentationIsOpen)
        Layouts.setCameraDockIsResizing(liveMeeting.layouts, msg.body.isResizing)
        Layouts.setCameraPosition(liveMeeting.layouts, msg.body.cameraPosition)
        Layouts.setFocusedCamera(liveMeeting.layouts, msg.body.focusedCamera)
        Layouts.setPresentationVideoRate(liveMeeting.layouts, msg.body.presentationVideoRate)
        Layouts.setRequestedBy(liveMeeting.layouts, msg.header.userId)

        sendBroadcastLayoutEvtMsg(msg.header.userId)
      }
    }
  }

  def sendBroadcastLayoutEvtMsg(fromUserId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, fromUserId)
    val envelope = BbbCoreEnvelope(BroadcastLayoutEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(BroadcastLayoutEvtMsg.NAME, liveMeeting.props.meetingProp.intId, fromUserId)

    val body = BroadcastLayoutEvtMsgBody(
      Layouts.getCurrentLayout(liveMeeting.layouts),
      Layouts.getPushLayout(liveMeeting.layouts),
      Layouts.getPresentationIsOpen(liveMeeting.layouts),
      Layouts.getCameraDockIsResizing(liveMeeting.layouts),
      Layouts.getCameraPosition(liveMeeting.layouts),
      Layouts.getFocusedCamera(liveMeeting.layouts),
      Layouts.getPresentationVideoRate(liveMeeting.layouts),
      Layouts.getLayoutSetter(liveMeeting.layouts)
    )
    val event = BroadcastLayoutEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }
}
