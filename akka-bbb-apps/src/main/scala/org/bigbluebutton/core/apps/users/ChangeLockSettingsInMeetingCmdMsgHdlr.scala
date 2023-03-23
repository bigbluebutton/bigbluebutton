package org.bigbluebutton.core.apps.users

import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.Permissions
import org.bigbluebutton.core2.message.senders.{ MsgBuilder }

trait ChangeLockSettingsInMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSetLockSettings(msg: ChangeLockSettingsInMeetingCmdMsg): Unit = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change lock settings"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val settings = Permissions(
        disableCam = msg.body.disableCam,
        disableMic = msg.body.disableMic,
        disablePrivChat = msg.body.disablePrivChat,
        disablePubChat = msg.body.disablePubChat,
        disableNotes = msg.body.disableNotes,
        hideUserList = msg.body.hideUserList,
        lockOnJoin = msg.body.lockOnJoin,
        lockOnJoinConfigurable = msg.body.lockOnJoinConfigurable,
        hideViewersCursor = msg.body.hideViewersCursor
      )

      if (!MeetingStatus2x.permissionsEqual(liveMeeting.status, settings) || !MeetingStatus2x.permisionsInitialized(liveMeeting.status)) {
        MeetingStatus2x.initializePermissions(liveMeeting.status)

        val oldPermissions = MeetingStatus2x.getPermissions(liveMeeting.status)

        MeetingStatus2x.setPermissions(liveMeeting.status, settings)

        // Dial-in
        def buildLockMessage(meetingId: String, userId: String, lockedBy: String, locked: Boolean): BbbCommonEnvCoreMsg = {
          val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
          val envelope = BbbCoreEnvelope(UserLockedInMeetingEvtMsg.NAME, routing)
          val body = UserLockedInMeetingEvtMsgBody(userId, locked, lockedBy)
          val header = BbbClientMsgHeader(UserLockedInMeetingEvtMsg.NAME, meetingId, userId)
          val event = UserLockedInMeetingEvtMsg(header, body)

          BbbCommonEnvCoreMsg(envelope, event)
        }

        if (oldPermissions.disableCam != settings.disableCam) {
          if (settings.disableCam) {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.disableCam",
              "Label to disable cam notification",
              Vector()
            )
            outGW.send(notifyEvent)

            LockSettingsUtil.enforceCamLockSettingsForAllUsers(liveMeeting, outGW)
          } else {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.enableCam",
              "Label to enable cam notification",
              Vector()
            )
            outGW.send(notifyEvent)
          }
        }

        if (oldPermissions.disableMic != settings.disableMic) {
          if (settings.disableMic) {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.disableMic",
              "Label to disable mic notification",
              Vector()
            )
            outGW.send(notifyEvent)
            VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
              if (vu.intId.startsWith(IntIdPrefixType.DIAL_IN)) { // only Dial-in users need this
                val eventExplicitLock = buildLockMessage(liveMeeting.props.meetingProp.intId, vu.intId, msg.body.setBy, settings.disableMic)
                outGW.send(eventExplicitLock)
              }
            }
            LockSettingsUtil.enforceLockSettingsForAllVoiceUsers(liveMeeting, outGW)
          } else {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.enableMic",
              "Label to enable mic notification",
              Vector()
            )
            outGW.send(notifyEvent)
          }
        }

        if (oldPermissions.disablePrivChat != settings.disablePrivChat) {
          if (settings.disablePrivChat) {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.disablePrivChat",
              "Label to disable private chat notification",
              Vector()
            )
            outGW.send(notifyEvent)
          } else {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.enablePrivChat",
              "Label to enable private chat notification",
              Vector()
            )
            outGW.send(notifyEvent)
          }
        }

        if (oldPermissions.disablePubChat != settings.disablePubChat) {
          if (settings.disablePubChat) {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.disablePubChat",
              "Label to disable public chat notification",
              Vector()
            )
            outGW.send(notifyEvent)
          } else {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.enablePubChat",
              "Label to enable public chat notification",
              Vector()
            )
            outGW.send(notifyEvent)
          }
        }

        if (oldPermissions.disableNotes != settings.disableNotes) {
          if (settings.disableNotes) {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.disableNotes",
              "Label to disable shared notes notification",
              Vector()
            )
            outGW.send(notifyEvent)
          } else {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.enableNotes",
              "Label to enable shared notes notification",
              Vector()
            )
            outGW.send(notifyEvent)
          }
        }

        if (oldPermissions.hideUserList != settings.hideUserList) {
          if (settings.hideUserList) {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.hideUserList",
              "Label to disable user list notification",
              Vector()
            )
            outGW.send(notifyEvent)
          } else {
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              liveMeeting.props.meetingProp.intId,
              "info",
              "lock",
              "app.userList.userOptions.showUserList",
              "Label to enable user list notification",
              Vector()
            )
            outGW.send(notifyEvent)
          }
        }

        val routing = Routing.addMsgToClientRouting(
          MessageTypes.BROADCAST_TO_MEETING,
          props.meetingProp.intId,
          msg.body.setBy
        )
        val envelope = BbbCoreEnvelope(
          LockSettingsInMeetingChangedEvtMsg.NAME,
          routing
        )
        val body = LockSettingsInMeetingChangedEvtMsgBody(
          disableCam = settings.disableCam,
          disableMic = settings.disableMic,
          disablePrivChat = settings.disablePrivChat,
          disablePubChat = settings.disablePubChat,
          disableNotes = settings.disableNotes,
          hideUserList = settings.hideUserList,
          lockOnJoin = settings.lockOnJoin,
          lockOnJoinConfigurable = settings.lockOnJoinConfigurable,
          hideViewersCursor = settings.hideViewersCursor,
          msg.body.setBy
        )
        val header = BbbClientMsgHeader(
          LockSettingsInMeetingChangedEvtMsg.NAME,
          props.meetingProp.intId,
          msg.body.setBy
        )

        outGW.send(BbbCommonEnvCoreMsg(envelope, LockSettingsInMeetingChangedEvtMsg(header, body)))
      }
    }
  }
}
