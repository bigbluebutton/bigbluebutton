package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.core.api.SendTimeRemainingAuditInternalMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait SendTimeRemainingUpdateHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSendTimeRemainingUpdate(msg: SendTimeRemainingAuditInternalMsg, state: MeetingState2x): MeetingState2x = {
    if (state.expiryTracker.durationInMs > 0) {
      val endMeetingTime = state.expiryTracker.endMeetingTime()
      val timeRemaining = TimeUtil.millisToSeconds(endMeetingTime - TimeUtil.timeNowInMs())

      if (timeRemaining > 0) {
        val event = MsgBuilder.buildMeetingTimeRemainingUpdateEvtMsg(liveMeeting.props.meetingProp.intId, timeRemaining.toInt)
        outGW.send(event)
      }
    }

    state
  }

}
