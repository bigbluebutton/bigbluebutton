package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Webcams
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait EjectUserCamerasCmdMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleEjectUserCamerasCmdMsg(msg: EjectUserCamerasCmdMsg): Unit = {
    val requesterUserId = msg.header.userId
    val meetingId = liveMeeting.props.meetingProp.intId
    val userToEject = msg.body.userId
    val ejectionDisabled = !liveMeeting.props.usersProp.allowModsToEjectCameras
    val isBreakout = liveMeeting.props.meetingProp.isBreakout
    val badPermission = permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      requesterUserId
    )

    if (ejectionDisabled || isBreakout || badPermission) {
      val reason = "No permission to eject cameras from user."
      PermissionCheck.ejectUserForFailedPermission(
        meetingId,
        requesterUserId,
        reason,
        outGW,
        liveMeeting
      )
    } else {
      log.info("Ejecting user cameras.  meetingId=" + meetingId
        + " userId=" + userToEject
        + " requesterUserId=" + requesterUserId)
      val broadcastedWebcams = Webcams.findWebcamsForUser(liveMeeting.webcams, userToEject)
      broadcastedWebcams foreach { webcam =>
        // Goes to SFU and comes back through CamBroadcastStoppedInSfuEvtMsg
        val event = MsgBuilder.buildCamBroadcastStopSysMsg(
          meetingId, userToEject, webcam.stream.id
        )
        outGW.send(event)
      }
    }
  }
}
