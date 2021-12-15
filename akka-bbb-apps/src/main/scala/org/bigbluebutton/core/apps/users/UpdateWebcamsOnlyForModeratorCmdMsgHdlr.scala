package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.LockSettingsUtil

trait UpdateWebcamsOnlyForModeratorCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUpdateWebcamsOnlyForModeratorCmdMsg(msg: UpdateWebcamsOnlyForModeratorCmdMsg) {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change lock settings"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      if (MeetingStatus2x.webcamsOnlyForModeratorEnabled(liveMeeting.status) != msg.body.webcamsOnlyForModerator) {
        log.info("Change webcams only for moderator status. meetingId=" + liveMeeting.props.meetingProp.intId + " webcamsOnlyForModeratorrecording=" + msg.body.webcamsOnlyForModerator)
        MeetingStatus2x.setWebcamsOnlyForModerator(liveMeeting.status, msg.body.webcamsOnlyForModerator)
        LockSettingsUtil.enforceCamLockSettingsForAllUsers(liveMeeting, outGW)
        val event = buildWebcamsOnlyForModeratorChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.setBy, msg.body.webcamsOnlyForModerator)
        outGW.send(event)
      }
    }

    def buildWebcamsOnlyForModeratorChangedEvtMsg(meetingId: String, userId: String, webcamsOnlyForModerator: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(WebcamsOnlyForModeratorChangedEvtMsg.NAME, routing)
      val body = WebcamsOnlyForModeratorChangedEvtMsgBody(webcamsOnlyForModerator, userId)
      val header = BbbClientMsgHeader(WebcamsOnlyForModeratorChangedEvtMsg.NAME, meetingId, userId)
      val event = WebcamsOnlyForModeratorChangedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }
  }
}
