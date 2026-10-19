package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.MeetingDAO
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

object SetRoomModeCmdMsgHdlr {
  // Mode names belong to the front-end (e.g. "class", "meeting"); the server only
  // checks the shape. Empty means the room is not configured.
  val RoomModePattern = "^([a-z][a-z0-9-]{0,31})?$".r

  def isValidRoomMode(roomMode: String): Boolean = RoomModePattern.matches(roomMode)
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
    } else if (msg.body.roomMode != MeetingStatus2x.roomMode(liveMeeting.status)) {
      MeetingStatus2x.setRoomMode(liveMeeting.status, msg.body.roomMode)
      MeetingDAO.updateRoomMode(meetingId, msg.body.roomMode)

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, msg.header.userId)
      val envelope = BbbCoreEnvelope(RoomModeChangedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(RoomModeChangedEvtMsg.NAME, meetingId, msg.header.userId)
      val body = RoomModeChangedEvtMsgBody(msg.body.roomMode, msg.body.setBy)
      outGW.send(BbbCommonEnvCoreMsg(envelope, RoomModeChangedEvtMsg(header, body)))
    }
  }
}
