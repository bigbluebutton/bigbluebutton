package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, GetWebcamsOnlyForModeratorReqMsg, GetWebcamsOnlyForModeratorRespMsg, GetWebcamsOnlyForModeratorRespMsgBody, MessageTypes, Routing, ScreenSharePermissionUpdateCmdMsg }
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.apps.webcam.CameraHdlrHelpers.permissionFailed
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.MeetingDAO
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.MeetingStatus2x

trait ScreenSharePermissionUpdateCmdMsgHdlr {
  this: WebcamApp2x =>
  object ScreenSharePermissionsType {
    val PRESENTER = "PRESENTER"
    val MODERATORS = "MODERATORS"
    val VIEWERS = "VIEWERS"

    val screenShareBroadcastAllowedForPermissionsType = Set(PRESENTER, MODERATORS, VIEWERS)
    val viewerScreenShareViewAllowedForPermissionsType = Set(MODERATORS, VIEWERS)
  }
  def handle(
      msg:         ScreenSharePermissionUpdateCmdMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val setBy = msg.body.setBy
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val screenShareBroadcastAllowedFor = msg.body.screenShareBroadcastAllowedFor
      val viewerScreenShareViewAllowedFor = msg.body.viewerScreenShareViewAllowedFor

      if (ScreenSharePermissionsType.screenShareBroadcastAllowedForPermissionsType.contains(screenShareBroadcastAllowedFor)
        && ScreenSharePermissionsType.viewerScreenShareViewAllowedForPermissionsType.contains(viewerScreenShareViewAllowedFor)) {
        // TODO: update live meeting or create a new field on meeting status
        MeetingDAO.updateScreenSharePermissions(
          meetingId,
          screenShareBroadcastAllowedFor = screenShareBroadcastAllowedFor,
          viewerScreenShareViewAllowedFor = viewerScreenShareViewAllowedFor,
          setBy = setBy
        )
      }
    } else {
      val reason = "No permission to change screen share Permissions."
      PermissionCheck.ejectUserForFailedPermission(
        meetingId,
        userId = setBy,
        reason,
        bus.outGW,
        liveMeeting
      )
    }
  }

}
