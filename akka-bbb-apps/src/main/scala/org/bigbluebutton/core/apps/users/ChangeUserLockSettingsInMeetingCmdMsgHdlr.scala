package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ UserLockSettings, Users2x, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ChangeUserLockSettingsInMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleChangeUserLockSettingsInMeetingCmdMsg(msg: ChangeUserLockSettingsInMeetingCmdMsg) {

    def build(meetingId: String, userId: String, disablePubChat: Boolean, setBy: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserLockSettingsInMeetingChangedEvtMsg.NAME, routing)
      val body = UserLockSettingsInMeetingChangedEvtMsgBody(userId, disablePubChat = disablePubChat, setBy = setBy)
      val header = BbbClientMsgHeader(UserLockSettingsInMeetingChangedEvtMsg.NAME, meetingId, userId)
      val event = UserLockSettingsInMeetingChangedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to lock user chat in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      log.info("Lock user chat. meetingId=" + props.meetingProp.intId + " userId=" + msg.body.userId + " disablePubChat=" + msg.body.disablePubChat)

      val updatedUserLockSettings = UserLockSettings(disablePublicChat = msg.body.disablePubChat)

      for {
        user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
        _ <- Users2x.setUserLockSettings(liveMeeting.users2x, user.intId, updatedUserLockSettings)
      } yield {
        val event = build(props.meetingProp.intId, msg.body.userId, msg.body.disablePubChat, msg.body.setBy)
        outGW.send(event)
      }

    }
  }
}
