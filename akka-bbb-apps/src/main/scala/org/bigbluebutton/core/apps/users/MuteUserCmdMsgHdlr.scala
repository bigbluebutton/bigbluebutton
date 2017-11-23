package org.bigbluebutton.core.apps.users

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs.MuteUserCmdMsg
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait MuteUserCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleMuteUserCmdMsg(msg: MuteUserCmdMsg) {
    if (msg.body.userId != msg.header.userId && permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to mute user."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val voiceConf = liveMeeting.props.voiceProp.voiceConf

      log.info("Received mute user request. meetingId=" + meetingId + " userId="
        + msg.body.userId)
      for {
        u <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
      } yield {
        if (u.muted != msg.body.mute) {
          log.info("Send mute user request. meetingId=" + meetingId + " userId=" + u.intId + " user=" + u)
          val event = MsgBuilder.buildMuteUserInVoiceConfSysMsg(meetingId, voiceConf,
            u.voiceUserId, msg.body.mute)
          outGW.send(event)
        }
      }
    }

  }
}
