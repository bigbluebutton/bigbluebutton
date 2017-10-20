package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.SendTimeRemainingAuditInternalMsg
import org.bigbluebutton.core.domain.{ MeetingState2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil

trait SendTimeRemainingUpdateHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingAuditInternalMsg, state: MeetingState2x): MeetingState2x = {

    if (state.expiryTracker.durationInMs > 0) {
      val endMeetingTime = state.expiryTracker.endMeetingTime()
      val timeRemaining = TimeUtil.millisToSeconds(endMeetingTime - TimeUtil.timeNowInMs())

      def buildMeetingTimeRemainingUpdateEvtMsg(meetingId: String, timeLeftInSec: Long): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
        val envelope = BbbCoreEnvelope(MeetingTimeRemainingUpdateEvtMsg.NAME, routing)
        val body = MeetingTimeRemainingUpdateEvtMsgBody(timeLeftInSec)
        val header = BbbClientMsgHeader(MeetingTimeRemainingUpdateEvtMsg.NAME, meetingId, "not-used")
        val event = MeetingTimeRemainingUpdateEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      if (timeRemaining > 0) {
        val event = buildMeetingTimeRemainingUpdateEvtMsg(liveMeeting.props.meetingProp.intId, timeRemaining.toInt)
        outGW.send(event)
      }

    }

    state
  }

}
