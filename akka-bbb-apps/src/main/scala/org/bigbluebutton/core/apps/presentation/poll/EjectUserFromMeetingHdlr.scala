package org.bigbluebutton.core.apps.presentation.poll

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models.{ UserState, Users2x }

trait EjectUserFromMeetingHdlr {
  this: PollApp2x =>

  def handle(msg: EjectUserFromMeeting, userToEject: UserState) {
    // Stop poll if one is running as presenter left.
    log.warning("TODO: Stop poll when presenter is ejected")
    //handleStopPollRequest(StopPollRequest(liveMeeting.props.meetingProp.intId, assignedBy))
  }
}
