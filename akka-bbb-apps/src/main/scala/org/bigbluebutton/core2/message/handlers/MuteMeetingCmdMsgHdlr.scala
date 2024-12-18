package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.NotificationDAO
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.apps.voice.VoiceApp

trait MuteMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleMuteMeetingCmdMsg(msg: MuteMeetingCmdMsg): Unit = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to mute meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      if (msg.body.mute != MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
        if (msg.body.mute) {
          val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
            liveMeeting.props.meetingProp.intId,
            "info",
            "mute",
            "app.toast.meetingMuteOn.label",
            "Message used when meeting has been muted",
            Vector()
          )
          outGW.send(notifyEvent)
          NotificationDAO.insert(notifyEvent)

          MeetingStatus2x.muteMeeting(liveMeeting.status)
        } else {
          val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
            liveMeeting.props.meetingProp.intId,
            "info",
            "unmute",
            "app.toast.meetingMuteOff.label",
            "Message used when meeting has been unmuted",
            Vector()
          )
          outGW.send(notifyEvent)
          NotificationDAO.insert(notifyEvent)

          MeetingStatus2x.unmuteMeeting(liveMeeting.status)
        }

        val muted = MeetingStatus2x.isMeetingMuted(liveMeeting.status)
        val meetingMutedEvent = MsgBuilder.buildMeetingMutedEvtMsg(
          props.meetingProp.intId,
          msg.body.mutedBy,
          muted,
          msg.body.mutedBy
        )

        outGW.send(meetingMutedEvent)

        // We no longer want to unmute users when meeting mute is turned off
        if (muted) {
          VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
            if (!vu.listenOnly) {
              VoiceApp.muteUserInVoiceConf(liveMeeting, outGW, vu.intId, muted)
            }
          }
        }
      }
    }

  }
}
