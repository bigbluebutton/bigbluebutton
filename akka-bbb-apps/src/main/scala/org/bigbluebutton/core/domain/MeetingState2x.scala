package org.bigbluebutton.core.domain

object MeetingState2x {

}

case class MeetingState2x(
  inactivityTracker: MeetingInactivityTracker,
  expiryTracker:     MeetingExpiryTracker
)

