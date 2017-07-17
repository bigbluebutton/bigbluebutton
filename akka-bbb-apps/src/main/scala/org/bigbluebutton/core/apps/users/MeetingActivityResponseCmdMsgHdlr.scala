package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.domain.{ MeetingInactivityTracker, MeetingState2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, MeetingInactivityTrackerHelper }

trait MeetingActivityResponseCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleMeetingActivityResponseCmdMsg(
    msg:    MeetingActivityResponseCmdMsg,
    state:  MeetingState2x,
    helper: MeetingInactivityTrackerHelper
  ): MeetingState2x = {
    helper.processMeetingActivityResponse(liveMeeting.props, outGW, msg)
    MeetingInactivityTracker.resetWarningSentAndTimestamp(state)
  }
}
