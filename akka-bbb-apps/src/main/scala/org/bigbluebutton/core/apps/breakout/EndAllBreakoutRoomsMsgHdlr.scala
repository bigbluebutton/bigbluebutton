package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.EndBreakoutRoomInternalMsg
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait EndAllBreakoutRoomsMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleEndAllBreakoutRoomsMsg(msg: EndAllBreakoutRoomsMsg, state: MeetingState2x): MeetingState2x = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to end breakout rooms for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else {
      for {
        model <- state.breakout
      } yield {
        model.rooms.values.foreach { room =>
          eventBus.publish(BigBlueButtonEvent(room.id, EndBreakoutRoomInternalMsg(props.breakoutProps.parentId, room.id)))
        }
      }

      state.update(None)
    }
  }
}
