package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.EndBreakoutRoomInternalMsg
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingState2x }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder }

trait EndAllBreakoutRoomsMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleEndAllBreakoutRoomsMsg(msg: EndAllBreakoutRoomsMsg, state: MeetingState2x): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val reason = "No permission to end breakout rooms for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else {
      for {
        model <- state.breakout
      } yield {
        model.rooms.values.foreach { room =>
          eventBus.publish(BigBlueButtonEvent(room.id, EndBreakoutRoomInternalMsg(meetingId, room.id, MeetingEndReason.BREAKOUT_ENDED_BY_MOD)))
        }

        val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
          meetingId,
          "info",
          "rooms",
          "app.toast.breakoutRoomEnded",
          "Message when the breakout room is ended",
          Vector()
        )
        outGW.send(notifyEvent)

      }

      state.update(None)
    }
  }
}
