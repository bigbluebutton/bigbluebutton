package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsBooleanOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.LayoutDAO
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.OutMsgRouter

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
    } else if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to hide users without camera."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      Layouts.setHideUsersWithoutCamera(liveMeeting.layouts, msg.body.hideUsersWithoutCamera)
      LayoutDAO.insertOrUpdate(liveMeeting.props.meetingProp.intId, liveMeeting.layouts)
      sendSetHideUsersWithoutCameraEvtMsg(msg.header.userId)
    }
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
