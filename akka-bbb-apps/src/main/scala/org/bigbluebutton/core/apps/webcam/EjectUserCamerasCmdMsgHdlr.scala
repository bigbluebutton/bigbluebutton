package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Webcams
import org.bigbluebutton.core.running.LiveMeeting

trait EjectUserCamerasCmdMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         EjectUserCamerasCmdMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val requesterUserId = msg.header.userId
    val userId = msg.body.userId

    val allow = CameraHdlrHelpers.isCameraEjectAllowed(
      liveMeeting,
      requesterUserId
    )

    if (!allow) {
      val reason = "No permission to eject cameras from user."
      PermissionCheck.ejectUserForFailedPermission(
        meetingId,
        requesterUserId,
        reason,
        bus.outGW,
        liveMeeting
      )
    } else {
      log.info(s"Ejecting user cameras. meetingId=${meetingId} userId=${userId} requesterUserId=${requesterUserId}")
      Webcams.findWebcamsForUser(liveMeeting.webcams, userId) foreach { webcam =>
        // Goes to SFU and comes back through CamBroadcastStoppedInSfuEvtMsg
        CameraHdlrHelpers.requestBroadcastedCamEjection(
          meetingId,
          userId,
          webcam.streamId,
          bus.outGW
        )
      }
    }
  }
}
