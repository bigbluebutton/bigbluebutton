package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.EndBreakoutRoomInternalMsg
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.MeetingEndReason
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting }

trait EndBreakoutRoomInternalMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway
  val eventBus: IncomingEventBus

  def handleEndBreakoutRoomInternalMsg(msg: EndBreakoutRoomInternalMsg): Unit = {
    sendEndMeetingDueToExpiry(MeetingEndReason.ENDED_BY_PARENT, eventBus, outGW, liveMeeting)
  }
}
