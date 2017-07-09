package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ BreakoutRoomsTimeRemainingUpdateOutMessage, MeetingTimeRemainingUpdate, SendTimeRemainingUpdate }
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait SendTimeRemainingUpdateHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingUpdate) {
    if (liveMeeting.props.durationProps.duration > 0) {
      val endMeetingTime = MeetingStatus2x.startedOn(liveMeeting.status) + (liveMeeting.props.durationProps.duration * 60)
      val timeRemaining = endMeetingTime - liveMeeting.timeNowInSeconds

      def buildMeetingTimeRemainingUpdateEvtMsg(meetingId: String, timeLeftInSec: Long): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
        val envelope = BbbCoreEnvelope(MeetingTimeRemainingUpdateEvtMsg.NAME, routing)
        val body = MeetingTimeRemainingUpdateEvtMsgBody(timeLeftInSec)
        val header = BbbClientMsgHeader(MeetingTimeRemainingUpdateEvtMsg.NAME, meetingId, "not-used")
        val event = MeetingTimeRemainingUpdateEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildMeetingTimeRemainingUpdateEvtMsg(liveMeeting.props.meetingProp.intId, timeRemaining.toInt)
      outGW.send(event)
    }
    if (!liveMeeting.props.meetingProp.isBreakout && !BreakoutRooms.getRooms(liveMeeting.breakoutRooms).isEmpty) {
      val endMeetingTime = BreakoutRooms.breakoutRoomsStartedOn(liveMeeting.breakoutRooms) +
        (BreakoutRooms.breakoutRoomsdurationInMinutes(liveMeeting.breakoutRooms) * 60)
      val timeRemaining = endMeetingTime - liveMeeting.timeNowInSeconds

      def buildBreakoutRoomsTimeRemainingUpdateEvtMsg(meetingId: String, timeLeftInSec: Long): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
        val envelope = BbbCoreEnvelope(BreakoutRoomsTimeRemainingUpdateEvtMsg.NAME, routing)
        val body = BreakoutRoomsTimeRemainingUpdateEvtMsgBody(timeLeftInSec)
        val header = BbbClientMsgHeader(BreakoutRoomsTimeRemainingUpdateEvtMsg.NAME, meetingId, "not-used")
        val event = BreakoutRoomsTimeRemainingUpdateEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = buildBreakoutRoomsTimeRemainingUpdateEvtMsg(liveMeeting.props.meetingProp.intId, timeRemaining.toInt)

      outGW.send(event)
    } else if (BreakoutRooms.breakoutRoomsStartedOn(liveMeeting.breakoutRooms) != 0) {
      BreakoutRooms.breakoutRoomsdurationInMinutes(liveMeeting.breakoutRooms, 0)
      BreakoutRooms.breakoutRoomsStartedOn(liveMeeting.breakoutRooms, 0)
    }
  }

}
