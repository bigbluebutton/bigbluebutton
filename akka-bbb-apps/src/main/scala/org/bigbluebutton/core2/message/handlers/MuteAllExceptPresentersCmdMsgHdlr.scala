package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ UserState, Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.NotificationDAO
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.apps.voice.VoiceApp

trait MuteAllExceptPresentersCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleMuteAllExceptPresentersCmdMsg(msg: MuteAllExceptPresentersCmdMsg) {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to mute all except presenters."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      if (msg.body.mute) {
        val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
          liveMeeting.props.meetingProp.intId,
          "info",
          "mute",
          "app.toast.muteAllViewers.label",
          "Message used when viewers of a meeting have been muted",
          Map()
        )
        outGW.send(notifyEvent)
        NotificationDAO.insert(notifyEvent)

        // We no longer want to unmute users when meeting mute is turned off
        // I think the correct flow would be to find those who are presenters and exclude them
        // from the list of voice users. The remaining, mute.
        VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
          if (!vu.listenOnly) {
            Users2x.findWithIntId(liveMeeting.users2x, vu.intId) match {
              case Some(u) => if (!u.presenter) VoiceApp.muteUserInVoiceConf(liveMeeting, outGW, vu.intId, muted = true)
              case None    => VoiceApp.muteUserInVoiceConf(liveMeeting, outGW, vu.intId, muted = true)
            }
          }
        }
      }
    }
  }
}
