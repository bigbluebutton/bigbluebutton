package org.bigbluebutton.core2.message.handlers.meeting

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting }

trait EndMeetingSysCmdMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway
  val eventBus: IncomingEventBus

  def handleEndMeeting(msg: EndMeetingSysCmdMsg) {
    endMeeting(outGW, liveMeeting)

    if (liveMeeting.props.meetingProp.isBreakout) {
      log.info(
        "Informing parent meeting {} that a breakout room has been ended {}",
        liveMeeting.props.breakoutProps.parentId, liveMeeting.props.meetingProp.intId
      )
      notifyParentThatBreakoutEnded(eventBus, liveMeeting)
    }

    destroyMeeting(eventBus, liveMeeting.props.meetingProp.intId)
  }

}
