package org.bigbluebutton.core.domain

case class MeetingInactivityTracker(
  maxInactivityTimeoutMinutes: Int,
  warningMinutesBeforeMax:     Int,
  lastActivityTimeInMinutes:   Long,
  warningSent:                 Boolean,
  warningSentOnTimeInMinutes:  Long
)

case class MeetingExpiryTracker(startedOnInMinutes: Long, meetingJoined: Boolean, lastUserLeftOn: Long)
