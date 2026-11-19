package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.BreakoutRoomUserDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UnassignUserFromBreakoutReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUnassignUserFromBreakoutReqMsg(msg: UnassignUserFromBreakoutReqMsg, state: MeetingState2x): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val reason = "No permission to unassign user from breakout room."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val roomOpt = for {
        breakoutModel <- state.breakout
        room <- breakoutModel.find(msg.body.breakoutId)
      } yield (breakoutModel, room)

      roomOpt match {
        case Some((breakoutModel, room)) =>
          BreakoutHdlrHelpers.ejectUserFromBreakoutRoom(eventBus, meetingId, room, msg.body.userId, msg.header.userId, "User unassigned from breakout room")
          BreakoutHdlrHelpers.revokeUserAccessToBreakoutRooms(liveMeeting, eventBus, breakoutModel.rooms.values, msg.body.userId)
          BreakoutRoomUserDAO.unassignUser(meetingId, msg.body.userId)
        case None =>
          log.warning("Ignoring UnassignUserFromBreakoutReqMsg. Room {} not found in meeting {}", msg.body.breakoutId, meetingId)
      }
    }

    state
  }
}
