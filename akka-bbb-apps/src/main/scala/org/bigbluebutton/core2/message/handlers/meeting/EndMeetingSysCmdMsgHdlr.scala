package org.bigbluebutton.core2.message.handlers.meeting

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.MeetingEndReason
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting }

trait EndMeetingSysCmdMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway
  val eventBus: IncomingEventBus

  def handleEndMeeting(msg: EndMeetingSysCmdMsg) {
    sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_FROM_API, eventBus, outGW, liveMeeting)
  }

}
