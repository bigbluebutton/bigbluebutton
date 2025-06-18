package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.MuteUserCmdMsg
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.apps.voice.VoiceApp
import org.bigbluebutton.core.models.{ Roles, Users2x, VoiceUsers }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait MuteUserCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleMuteUserCmdMsg(msg: MuteUserCmdMsg) {
    val unmuteDisabled = !liveMeeting.props.usersProp.allowModsToUnmuteUsers && !msg.body.mute
    if (msg.body.userId != msg.header.userId && (unmuteDisabled || permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    ))) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val muteUnmuteStr: String = if (msg.body.mute) "mute" else "unmute"
      val reason = "No permission to " + muteUnmuteStr + " user."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val voiceConf = liveMeeting.props.voiceProp.voiceConf

      log.info("Received mute user request. meetingId=" + meetingId + " userId="
        + msg.body.userId)

      val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
      for {
        requester <- Users2x.findWithIntId(
          liveMeeting.users2x,
          msg.header.userId
        )
        u <- VoiceUsers.findWithIntId(
          liveMeeting.voiceUsers,
          msg.body.userId
        )
      } yield {

        if (requester.role != Roles.MODERATOR_ROLE
          && permissions.disableMic
          && requester.locked
          && u.muted &&
          msg.body.userId == msg.header.userId) {
          // unmuting self while not moderator and mic disabled. Do not allow.
        } else {
          if (u.muted != msg.body.mute) {
            log.info("Send mute user request. meetingId=" + meetingId + " userId=" + u.intId + " user=" + u)

            val isUnmuting = !msg.body.mute
            val isActingOnOtherUser = msg.body.userId != msg.header.userId
            val settingRequiresRequest = liveMeeting.props.usersProp.requireUserConsentBeforeUnmuting;

            val shouldRequestUnmute = isUnmuting && isActingOnOtherUser && settingRequiresRequest

            if (shouldRequestUnmute) {
              log.info("Requesting user to unmute. meetingId=" + meetingId + " userId=" + u.intId)
              VoiceApp.requestUnmute(
                liveMeeting,
                u.intId
              )
            } else {
              log.info("Directly muting/unmuting user. meetingId=" + meetingId + " userId=" + u.intId + " mute=" + msg.body.mute)
              VoiceApp.muteUserInVoiceConf(
                liveMeeting,
                outGW,
                u.intId,
                msg.body.mute
              )
            }
          }
        }
      }
    }
  }
}
