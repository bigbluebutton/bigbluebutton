package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.Permissions

trait ChangeLockSettingsInMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSetLockSettings(msg: ChangeLockSettingsInMeetingCmdMsg): Unit = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change lock settings"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val settings = Permissions(
        disableCam = msg.body.disableCam,
        disableMic = msg.body.disableMic,
        disablePrivChat = msg.body.disablePrivChat,
        disablePubChat = msg.body.disablePubChat,
        lockedLayout = msg.body.lockedLayout,
        lockOnJoin = msg.body.lockOnJoin,
        lockOnJoinConfigurable = msg.body.lockOnJoinConfigurable
      )

      if (!MeetingStatus2x.permissionsEqual(liveMeeting.status, settings) || !MeetingStatus2x.permisionsInitialized(liveMeeting.status)) {
        MeetingStatus2x.initializePermissions(liveMeeting.status)

        MeetingStatus2x.setPermissions(liveMeeting.status, settings)

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
          lockedLayout = settings.lockedLayout,
          lockOnJoin = settings.lockOnJoin,
          lockOnJoinConfigurable = settings.lockOnJoinConfigurable,
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
