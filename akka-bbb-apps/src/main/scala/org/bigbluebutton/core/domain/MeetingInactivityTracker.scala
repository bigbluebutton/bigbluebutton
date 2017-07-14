package org.bigbluebutton.core.domain

case class MeetingInactivityTracker(
  maxInactivityTimeoutMinutes: Int,
  warningMinutesBeforeMax:     Int,
  lastActivityTime:            Long,
  warningSent:                 Boolean,
  warningSentOn:               Long
)

case class MeetingExpiryTracker(lastUserLeftOn: Long)
