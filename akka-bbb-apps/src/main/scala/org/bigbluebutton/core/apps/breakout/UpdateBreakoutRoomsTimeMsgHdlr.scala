package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ UpdateBreakoutRoomTimeInternalMsg, SendTimeRemainingAuditInternalMsg }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil

trait UpdateBreakoutRoomsTimeMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUpdateBreakoutRoomsTimeMsg(msg: UpdateBreakoutRoomsTimeReqMsg, state: MeetingState2x): MeetingState2x = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to update time for breakout rooms for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else if (msg.body.timeInMinutes <= 0) {
      log.error("Error while trying to update {} minutes for breakout rooms time in meeting {}. Only positive values are allowed!", msg.body.timeInMinutes, props.meetingProp.intId)
      state
    } else {
      val updatedModel = for {
        breakoutModel <- state.breakout
        startedOn <- breakoutModel.startedOn
      } yield {
        val newSecsRemaining = msg.body.timeInMinutes * 60
        val breakoutRoomSecsElapsed = TimeUtil.millisToSeconds(System.currentTimeMillis()) - TimeUtil.millisToSeconds(startedOn);
        val newDurationInSeconds = breakoutRoomSecsElapsed.toInt + newSecsRemaining

        var isNewTimeHigherThanMeetingRemaining = false

        if (state.expiryTracker.durationInMs > 0) {
          val mainRoomEndTime = state.expiryTracker.startedOnInMs + state.expiryTracker.durationInMs
          val mainRoomSecsRemaining = TimeUtil.millisToSeconds(mainRoomEndTime - TimeUtil.timeNowInMs())
          val mainRoomTimeRemainingInMinutes = mainRoomSecsRemaining / 60

          //Avoid breakout room end later than main room
          //Keep 5 seconds of margin to finish breakout room and send informations to parent meeting
          if (newSecsRemaining > (mainRoomSecsRemaining - 5)) {
            log.error("Error while trying to update {} minutes for breakout rooms time in meeting {}. Parent meeting will end up in {} minutes!", msg.body.timeInMinutes, props.meetingProp.intId, mainRoomTimeRemainingInMinutes)
            isNewTimeHigherThanMeetingRemaining = true
          }
        }

        if (isNewTimeHigherThanMeetingRemaining) {
          breakoutModel
        } else {
          breakoutModel.rooms.values.foreach { room =>
            eventBus.publish(BigBlueButtonEvent(room.id, UpdateBreakoutRoomTimeInternalMsg(props.breakoutProps.parentId, room.id, newDurationInSeconds)))
          }
          log.debug("Updating {} minutes for breakout rooms time in meeting {}", msg.body.timeInMinutes, props.meetingProp.intId)
          breakoutModel.setTime(newDurationInSeconds)
        }
      }

      val event = buildUpdateBreakoutRoomsTimeEvtMsg(msg.body.timeInMinutes)
      outGW.send(event)

      //Force Update time remaining in the clients
      eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, SendTimeRemainingAuditInternalMsg(props.meetingProp.intId, msg.body.timeInMinutes)))

      updatedModel match {
        case Some(model) => state.update(Some(model))
        case None        => state
      }
    }
  }

  def buildUpdateBreakoutRoomsTimeEvtMsg(timeInMinutes: Int): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(UpdateBreakoutRoomsTimeEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UpdateBreakoutRoomsTimeEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")

    val body = UpdateBreakoutRoomsTimeEvtMsgBody(props.meetingProp.intId, timeInMinutes)
    val event = UpdateBreakoutRoomsTimeEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

}
