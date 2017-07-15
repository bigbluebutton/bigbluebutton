package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.domain.MeetingInactivityTracker
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, MeetingInactivityTrackerHelper }

trait MeetingActivityResponseCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleMeetingActivityResponseCmdMsg(
    msg:     MeetingActivityResponseCmdMsg,
    tracker: MeetingInactivityTracker
  ): MeetingInactivityTracker = {
    MeetingInactivityTrackerHelper.processMeetingActivityResponse(
      props = liveMeeting.props,
      outGW,
      msg,
      tracker
    )
  }
}
