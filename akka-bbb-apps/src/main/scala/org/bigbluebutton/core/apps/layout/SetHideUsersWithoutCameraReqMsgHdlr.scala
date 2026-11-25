package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsBooleanOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.{ LayoutDAO, NotificationDAO }
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait SetHideUsersWithoutCameraReqMsgHdlr extends RightsManagementTrait {
  this: LayoutApp2x =>

  val outGW: OutMsgRouter

  def handleSetHideUsersWithoutCameraReqMsg(msg: SetHideUsersWithoutCameraReqMsg): Unit = {
    // The client hides the toggle without the grid, so it couldn't turn the option off again.
    val isWebcamGridEnabled = !liveMeeting.props.meetingProp.disabledFeatures.contains("webcamGrid") &&
      getConfigPropertyValueByPathAsBooleanOrElse(liveMeeting.clientSettings, "public.kurento.pagination.gridEnabled", true)

    if (!isWebcamGridEnabled) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "Webcam grid is disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else if (liveMeeting.props.meetingProp.disabledFeatures.contains("layoutView") ||
      !getConfigPropertyValueByPathAsBooleanOrElse(liveMeeting.clientSettings, "public.layout.layoutViewEnabled", true)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "Layout view is disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to hide users without camera."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val changed = Layouts.getHideUsersWithoutCamera(liveMeeting.layouts) != msg.body.hideUsersWithoutCamera
      Layouts.setHideUsersWithoutCamera(liveMeeting.layouts, msg.body.hideUsersWithoutCamera)
      LayoutDAO.insertOrUpdate(liveMeeting.props.meetingProp.intId, liveMeeting.layouts)
      sendSetHideUsersWithoutCameraEvtMsg(msg.header.userId)
      if (changed) {
        notifyLayoutUpdate(msg.header.userId)
      }
    }
  }

  // Same confirmation push layout gives, since the option applies to everyone.
  private def notifyLayoutUpdate(userId: String): Unit = {
    val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
      userId,
      liveMeeting.props.meetingProp.intId,
      "info",
      "user",
      "app.layoutUpdate.label",
      "Notification to when the layout view options change for everyone",
      Map()
    )
    outGW.send(notifyEvent)
    NotificationDAO.insert(notifyEvent)
  }

  def sendSetHideUsersWithoutCameraEvtMsg(fromUserId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, fromUserId)
    val envelope = BbbCoreEnvelope(SetHideUsersWithoutCameraEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SetHideUsersWithoutCameraEvtMsg.NAME, liveMeeting.props.meetingProp.intId, fromUserId)
    val body = SetHideUsersWithoutCameraEvtMsgBody(Layouts.getHideUsersWithoutCamera(liveMeeting.layouts), fromUserId)
    val event = SetHideUsersWithoutCameraEvtMsg(header, body)

    outGW.send(BbbCommonEnvCoreMsg(envelope, event))
  }
}
