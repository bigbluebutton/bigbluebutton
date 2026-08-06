package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.LiveMeeting

trait RequestUserCameraCmdMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         RequestUserCameraCmdMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val requesterUserId = msg.header.userId
    val userId = msg.body.userId

    val allow = CameraHdlrHelpers.isCameraRequestAllowed(
      liveMeeting,
      requesterUserId
    )

    if (!allow) {
      val reason = "No permission to request user cameras."
      PermissionCheck.ejectUserForFailedPermission(
        meetingId,
        requesterUserId,
        reason,
        bus.outGW,
        liveMeeting
      )
    } else if (!liveMeeting.props.usersProp.requireUserConsentBeforeSharingCamera) {
      log.info(s"Ignoring camera request, requireUserConsentBeforeSharingCamera is disabled. meetingId=${meetingId}")
    } else if (userId == requesterUserId) {
      log.info(s"Ignoring camera request to self. meetingId=${meetingId} userId=${userId}")
    } else if (!CameraHdlrHelpers.canBeAskedToShareCamera(liveMeeting, userId)) {
      log.info(s"Ignoring camera request, user cannot share a camera. meetingId=${meetingId} userId=${userId}")
    } else {
      log.info(s"Requesting user camera. meetingId=${meetingId} userId=${userId} requesterUserId=${requesterUserId}")
      // Only the remote end can start a camera, so just flag the request.
      Users2x.setUserCameraRequested(liveMeeting.users2x, userId, requested = true)
    }
  }
}
