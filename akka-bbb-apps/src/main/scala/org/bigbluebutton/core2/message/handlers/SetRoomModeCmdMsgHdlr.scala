package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.domain.LockSettingsProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.MeetingDAO
import org.bigbluebutton.core.models.GuestsWaiting
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

object SetRoomModeCmdMsgHdlr {
  // Mode names belong to the front-end (e.g. "class", "meeting"); the server only
  // checks the shape. Empty means the room is not configured; it is only the
  // default, so a moderator cannot reopen the pre-flight panel for later arrivals.
  val RoomModePattern = "^[a-z][a-z0-9-]{0,31}$".r

  def isValidRoomMode(roomMode: String): Boolean = RoomModePattern.matches(roomMode)

  // The room's settings a mode controls, as they are now. The client applies them
  // before it sets the mode, through this same actor, so they are already in place.
  def appliedSettings(liveMeeting: LiveMeeting): RoomModeSettings = {
    val status = liveMeeting.status
    val permissions = MeetingStatus2x.getPermissions(status)
    RoomModeSettings(
      LockSettingsProps(
        disableCam = permissions.disableCam,
        disableMic = permissions.disableMic,
        disablePrivateChat = permissions.disablePrivChat,
        disablePublicChat = permissions.disablePubChat,
        disableNotes = permissions.disableNotes,
        hideUserList = permissions.hideUserList,
        lockOnJoin = permissions.lockOnJoin,
        lockOnJoinConfigurable = permissions.lockOnJoinConfigurable,
        hideViewersCursor = permissions.hideViewersCursor,
        hideViewersAnnotation = permissions.hideViewersAnnotation,
        presenterPolicy = permissions.presenterPolicy
      ),
      RoomModeUsersPolicies(
        MeetingStatus2x.webcamsOnlyForModeratorEnabled(status),
        GuestsWaiting.getGuestPolicy(liveMeeting.guestsWaiting).policy,
        MeetingStatus2x.multiUserWhiteboardEnabled(status)
      ),
      RoomModeVoiceSettings(MeetingStatus2x.isMeetingMuted(status))
    )
  }
}

trait SetRoomModeCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSetRoomModeCmdMsg(msg: SetRoomModeCmdMsg): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) || liveMeeting.props.meetingProp.isBreakout) {
      val reason = "No permission to set the room mode."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else if (!SetRoomModeCmdMsgHdlr.isValidRoomMode(msg.body.roomMode)) {
      log.warning("Ignoring invalid room mode. meetingId={} userId={} roomMode={}", meetingId, msg.header.userId, msg.body.roomMode)
    } else {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, msg.header.userId)

      if (msg.body.roomMode != MeetingStatus2x.roomMode(liveMeeting.status)) {
        MeetingStatus2x.setRoomMode(liveMeeting.status, msg.body.roomMode)
        MeetingDAO.updateRoomMode(meetingId, msg.body.roomMode)

        val envelope = BbbCoreEnvelope(RoomModeChangedEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(RoomModeChangedEvtMsg.NAME, meetingId, msg.header.userId)
        val body = RoomModeChangedEvtMsgBody(msg.body.roomMode, msg.body.setBy)
        outGW.send(BbbCommonEnvCoreMsg(envelope, RoomModeChangedEvtMsg(header, body)))
      }

      // Reported on every apply, the current mode included: the room modes tab applies
      // it again when one of its settings is edited.
      val envelope = BbbCoreEnvelope(RoomConfiguredEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(RoomConfiguredEvtMsg.NAME, meetingId, msg.header.userId)
      val settings = SetRoomModeCmdMsgHdlr.appliedSettings(liveMeeting)
      val body = RoomConfiguredEvtMsgBody(msg.body.roomMode, settings, msg.body.setBy, System.currentTimeMillis())
      outGW.send(BbbCommonEnvCoreMsg(envelope, RoomConfiguredEvtMsg(header, body)))
    }
  }
}
