package org.bigbluebutton.core.apps.users

import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.graphql.GraphqlMiddleware

trait LockUserInMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleLockUserInMeetingCmdMsg(msg: LockUserInMeetingCmdMsg) {

    def build(meetingId: String, userId: String, lockedBy: String, locked: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserLockedInMeetingEvtMsg.NAME, routing)
      val body = UserLockedInMeetingEvtMsgBody(userId, locked, lockedBy)
      val header = BbbClientMsgHeader(UserLockedInMeetingEvtMsg.NAME, meetingId, userId)
      val event = UserLockedInMeetingEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to lock user in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      for {
        uvo <- Users2x.setUserLocked(liveMeeting.users2x, msg.body.userId, msg.body.lock)
      } yield {
        if (msg.body.lock) {
          VoiceUsers.findWithIntId(liveMeeting.voiceUsers, uvo.intId).foreach { vu =>
            LockSettingsUtil.enforceLockSettingsForVoiceUser(vu, liveMeeting, outGW)
          }

          LockSettingsUtil.enforceCamLockSettingsForUser(uvo, liveMeeting, outGW)
        }

        // Force reconnection with graphql to refresh permissions
        for {
          u <- RegisteredUsers.findWithUserId(uvo.intId, liveMeeting.registeredUsers)
        } yield {
          GraphqlMiddleware.requestGraphqlReconnection(u.sessionToken, "lock_user_changed")
        }

        log.info("Lock user.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.intId + " locked=" + uvo.locked)
        val event = build(props.meetingProp.intId, uvo.intId, msg.body.lockedBy, uvo.locked)
        outGW.send(event)
      }
    }
  }
}
