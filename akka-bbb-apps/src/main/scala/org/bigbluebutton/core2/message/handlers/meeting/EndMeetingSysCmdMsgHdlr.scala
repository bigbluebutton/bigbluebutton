package org.bigbluebutton.core2.message.handlers.meeting

import org.bigbluebutton.common2.api.EndMeetingApiMsg
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingState2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }

trait EndMeetingSysCmdMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter
  val eventBus: InternalEventBus

  def handleEndMeeting(msg: EndMeetingSysCmdMsg, state: MeetingState2x): Unit = {
    endMeeting(msg.body.meetingId, state)
  }

  def handleEndMeeting(msg: EndMeetingApiMsg, state: MeetingState2x): Unit = {
    endMeeting(msg.meetingId, state)
  }

  def endMeeting(meetingId: String, state: MeetingState2x): Unit = {
    endAllBreakoutRooms(eventBus, liveMeeting, state, MeetingEndReason.ENDED_FROM_API)
    log.info("Meeting {} ended by from API.", meetingId)
    sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_FROM_API, eventBus, outGW, liveMeeting, "system")
  }

}
