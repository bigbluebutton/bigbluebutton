package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ ExtendBreakoutRoomTimeInternalMsg, SendTimeRemainingAuditInternalMsg }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil

trait ExtendBreakoutRoomsTimeMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleExtendBreakoutRoomsTimeMsg(msg: ExtendBreakoutRoomsTimeReqMsg, state: MeetingState2x): MeetingState2x = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to extend time for breakout rooms for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else if (msg.body.extendTimeInMinutes <= 0) {
      log.error("Error while trying to extend {} minutes for breakout rooms time in meeting {}. Only positive values are allowed!", msg.body.extendTimeInMinutes, props.meetingProp.intId)
      state
    } else {
      val updatedModel = for {
        breakoutModel <- state.breakout
        startedOn <- breakoutModel.startedOn
      } yield {
        val breakoutRoomEndTime = TimeUtil.millisToSeconds(startedOn) + TimeUtil.minutesToSeconds(breakoutModel.durationInMinutes)
        val breakoutRoomSecsRemaining = breakoutRoomEndTime - TimeUtil.millisToSeconds(System.currentTimeMillis())

        var isExtendTimeHigherThanMeetingRemaining = false

        if (state.expiryTracker.durationInMs > 0) {
          val mainRoomEndTime = state.expiryTracker.startedOnInMs + state.expiryTracker.durationInMs
          val mainRoomSecsRemaining = TimeUtil.millisToSeconds(mainRoomEndTime - TimeUtil.timeNowInMs())
          val mainRoomTimeRemainingInMinutes = mainRoomSecsRemaining / 60

          //Avoid breakout room end later than main room
          //Keep 5 seconds of margin to finish breakout room and send informations to parent meeting
          if (breakoutRoomSecsRemaining + TimeUtil.minutesToSeconds(msg.body.extendTimeInMinutes) > (mainRoomSecsRemaining - 5)) {
            log.error("Error while trying to extend {} minutes for breakout rooms time in meeting {}. Parent meeting will end up in {} minutes!", msg.body.extendTimeInMinutes, props.meetingProp.intId, mainRoomTimeRemainingInMinutes)
            isExtendTimeHigherThanMeetingRemaining = true
          }
        }

        if (isExtendTimeHigherThanMeetingRemaining) {
          breakoutModel
        } else {
          breakoutModel.rooms.values.foreach { room =>
            eventBus.publish(BigBlueButtonEvent(room.id, ExtendBreakoutRoomTimeInternalMsg(props.breakoutProps.parentId, room.id, msg.body.extendTimeInMinutes)))
          }
          log.debug("Extending {} minutes for breakout rooms time in meeting {}", msg.body.extendTimeInMinutes, props.meetingProp.intId)
          breakoutModel.extendTime(msg.body.extendTimeInMinutes)
        }
      }

      val event = buildExtendBreakoutRoomsTimeEvtMsg(msg.body.extendTimeInMinutes)
      outGW.send(event)

      //Force Update time remaining in the clients
      eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, SendTimeRemainingAuditInternalMsg(props.meetingProp.intId)))

      updatedModel match {
        case Some(model) => state.update(Some(model))
        case None        => state
      }
    }
  }

  def buildExtendBreakoutRoomsTimeEvtMsg(extendTimeInMinutes: Int): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(ExtendBreakoutRoomsTimeEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(ExtendBreakoutRoomsTimeEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")

    val body = ExtendBreakoutRoomsTimeEvtMsgBody(props.meetingProp.intId, extendTimeInMinutes)
    val event = ExtendBreakoutRoomsTimeEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

}
