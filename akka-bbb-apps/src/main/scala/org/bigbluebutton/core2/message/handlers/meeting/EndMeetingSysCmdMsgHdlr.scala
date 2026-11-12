package org.bigbluebutton.core2.message.handlers.meeting

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.domain.{ MeetingEndReason, MeetingState2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait EndMeetingSysCmdMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter
  val eventBus: InternalEventBus

  def handleEndMeeting(msg: EndMeetingSysCmdMsg, state: MeetingState2x): Unit = {
    // bbb-web also ends the breakout rooms of an ended meeting, so a room that is already ending
    // (by its parent or by its own expiry) can still get this request; ending it again would overwrite its end reason.
    if (MeetingStatus2x.hasMeetingEnded(liveMeeting.status)) {
      log.info("Meeting {} has already ended. Ignoring the end request from API.", msg.body.meetingId)
      return
    }

    endAllBreakoutRooms(eventBus, liveMeeting, state, MeetingEndReason.ENDED_FROM_API)
    log.info("Meeting {} ended by from API.", msg.body.meetingId)
    sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_FROM_API, eventBus, outGW, liveMeeting, "system")
  }

}
