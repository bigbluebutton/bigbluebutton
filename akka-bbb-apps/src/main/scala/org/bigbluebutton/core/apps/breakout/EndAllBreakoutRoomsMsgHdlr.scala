package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ EndBreakoutRoomInternalMsg, SendTimeRemainingAuditInternalMsg, UpdateBreakoutRoomTimeInternalMsg }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingState2x }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.util.TimeUtil

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
      if (msg.body.delayTimeInSeconds > 0) {
        //When delay greater than 0, set the new time for breakouts

        val updatedModel = for {
          model <- state.breakout
          startedOn <- model.startedOn
        } yield {
          val elapsedTime = TimeUtil.millisToSeconds(System.currentTimeMillis()) - TimeUtil.millisToSeconds(startedOn)
          val newDurationInSeconds = elapsedTime.toInt + msg.body.delayTimeInSeconds

          model.rooms.values.foreach { room =>
            eventBus.publish(BigBlueButtonEvent(room.id, UpdateBreakoutRoomTimeInternalMsg(props.breakoutProps.parentId, room.id, newDurationInSeconds)))
          }
          log.debug("Setting {} seconds for breakout rooms time in meeting {}", msg.body.delayTimeInSeconds, props.meetingProp.intId)
          model.setTime(newDurationInSeconds)

        }

        //Force Update time remaining in the clients
        eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, SendTimeRemainingAuditInternalMsg(props.meetingProp.intId)))

        updatedModel match {
          case Some(model) => state.update(Some(model))
          case None        => state
        }

      } else {
        //When delay is 0, finish breakout rooms immediately
        for {
          model <- state.breakout
        } yield {
          model.rooms.values.foreach { room =>
            eventBus.publish(BigBlueButtonEvent(room.id, EndBreakoutRoomInternalMsg(props.breakoutProps.parentId, room.id, MeetingEndReason.BREAKOUT_ENDED_BY_MOD)))
          }
        }
        state.update(None)
      }
    }
  }
}
