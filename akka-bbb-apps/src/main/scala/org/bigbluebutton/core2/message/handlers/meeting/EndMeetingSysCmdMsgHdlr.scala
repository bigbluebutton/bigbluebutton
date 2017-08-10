package org.bigbluebutton.core2.message.handlers.meeting

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
    endAllBreakoutRooms(eventBus, liveMeeting, state)
    log.info("Meeting {} ended by from API.", msg.body.meetingId)
    sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_FROM_API, eventBus, outGW, liveMeeting)
  }

}
