package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs.DeafenUserCmdMsg
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.apps.voice.VoiceApp
import org.bigbluebutton.core.models.{ Roles, VoiceUsers }

trait DeafenUserCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleDeafenUserCmdMsg(msg: DeafenUserCmdMsg): Unit = {
    if (msg.body.userId != msg.header.userId && (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    ))) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change user's deafen status."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val voiceConf = liveMeeting.props.voiceProp.voiceConf

      log.info("Received deafen user request. meetingId=" + meetingId
        + " userId=" + msg.body.userId
        + " deafen=" + msg.body.deaf)

      for {
        vu <- VoiceUsers.findWithIntId(
          liveMeeting.voiceUsers,
          msg.body.userId
        )
      } yield {
        if (vu.deafened != msg.body.deaf) {
          log.info("Send deafen user request. meetingId=" + meetingId
            + " userId=" + vu.intId
            + " user=" + vu)
          VoiceApp.deafenUserInVoiceConf(
            liveMeeting,
            outGW,
            vu.intId,
            msg.body.deaf
          )
        }
      }
    }
  }
}
