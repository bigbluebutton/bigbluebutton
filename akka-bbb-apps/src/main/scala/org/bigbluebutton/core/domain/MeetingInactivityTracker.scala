package org.bigbluebutton.core.domain

import org.bigbluebutton.core.util.TimeUtil

case class MeetingInactivityTracker(
    val maxInactivityTimeoutMinutes: Int,
    val warningMinutesBeforeMax:     Int,
    lastActivityTimestamp:           Long,
    warningSent:                     Boolean,
    warningSentOnTimestamp:          Long
) {
  def setWarningSentAndTimestamp(nowInSeconds: Long): MeetingInactivityTracker = {
    copy(warningSent = true, warningSentOnTimestamp = nowInSeconds)
  }

  def resetWarningSentAndTimestamp(): MeetingInactivityTracker = {
    copy(warningSent = false, warningSentOnTimestamp = 0L)
  }

  def updateLastActivityTimestamp(nowInSeconds: Long): MeetingInactivityTracker = {
    copy(lastActivityTimestamp = nowInSeconds)
  }

  def hasRecentActivity(nowInSeconds: Long): Boolean = {
    nowInSeconds - lastActivityTimestamp <
      TimeUtil.minutesToSeconds(maxInactivityTimeoutMinutes) -
      TimeUtil.minutesToSeconds(warningMinutesBeforeMax)
  }

  def isMeetingInactive(nowInSeconds: Long): Boolean = {
    warningSent &&
      (nowInSeconds - lastActivityTimestamp) >
      TimeUtil.minutesToSeconds(maxInactivityTimeoutMinutes)
  }

  def timeLeftInSeconds(nowInSeconds: Long): Long = {
    lastActivityTimestamp +
      TimeUtil.minutesToSeconds(maxInactivityTimeoutMinutes) - nowInSeconds
  }
}

case class MeetingExpiryTracker(
    startedOn:                              Long,
    userHasJoined:                          Boolean,
    lastUserLeftOn:                         Option[Long],
    durationInMinutes:                      Int,
    meetingExpireIfNoUserJoinedInMinutes:   Int,
    meetingExpireWhenLastUserLeftInMinutes: Int
) {
  def setMeetingStartedOn(timestampInSeconds: Long): MeetingExpiryTracker = {
    copy(startedOn = timestampInSeconds)
  }

  def setUserHasJoined(): MeetingExpiryTracker = {
    if (userHasJoined) {
      copy(userHasJoined = true)
    } else {
      copy()
    }
  }

  def setLastUserLeftOn(timestampInSeconds: Long): MeetingExpiryTracker = {
    copy(lastUserLeftOn = Some(timestampInSeconds))
  }

  def hasMeetingExpiredAfterLastUserLeft(timestampInSeconds: Long): Boolean = {
    val expire = for {
      lastUserLeftOn <- lastUserLeftOn
    } yield {
      timestampInSeconds - lastUserLeftOn >
        TimeUtil.minutesToSeconds(meetingExpireWhenLastUserLeftInMinutes)
    }

    expire.getOrElse(false)
  }

  def hasMeetingExpired(timestampInSeconds: Long): (Boolean, Option[String]) = {
    if (hasMeetingExpiredNeverBeenJoined(timestampInSeconds)) {
      (true, Some(MeetingEndReason.ENDED_WHEN_NOT_JOINED))
    } else if (meetingOverDuration(timestampInSeconds)) {
      (true, Some(MeetingEndReason.ENDED_AFTER_EXCEEDING_DURATION))
    } else if (hasMeetingExpiredAfterLastUserLeft(timestampInSeconds)) {
      (true, Some(MeetingEndReason.ENDED_WHEN_LAST_USER_LEFT))
    } else {
      (false, None)
    }
  }

  def hasMeetingExpiredNeverBeenJoined(nowInSeconds: Long): Boolean = {
    !userHasJoined && (nowInSeconds - startedOn > TimeUtil.minutesToSeconds(meetingExpireIfNoUserJoinedInMinutes))
  }

  def meetingOverDuration(nowInSeconds: Long): Boolean = {
    if (durationInMinutes == 0) {
      false
    } else {
      nowInSeconds > startedOn + TimeUtil.minutesToSeconds(durationInMinutes)
    }
  }

  def endMeetingTime(): Int = {
    (startedOn + TimeUtil.minutesToSeconds(durationInMinutes)).toInt
  }
}

