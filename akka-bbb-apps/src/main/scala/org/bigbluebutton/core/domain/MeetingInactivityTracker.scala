package org.bigbluebutton.core.domain

import org.bigbluebutton.core.util.TimeUtil

case class MeetingInactivityTracker(
    val maxInactivityTimeoutInMs: Long,
    val warningBeforeMaxInMs:     Long,
    lastActivityTimestampInMs:    Long,
    warningSent:                  Boolean,
    warningSentOnTimestampInMs:   Long
) {
  def setWarningSentAndTimestamp(nowInMs: Long): MeetingInactivityTracker = {
    copy(warningSent = true, warningSentOnTimestampInMs = nowInMs)
  }

  def resetWarningSentAndTimestamp(): MeetingInactivityTracker = {
    copy(warningSent = false, warningSentOnTimestampInMs = 0L)
  }

  def updateLastActivityTimestamp(nowInMs: Long): MeetingInactivityTracker = {
    copy(lastActivityTimestampInMs = nowInMs)
  }

  def hasRecentActivity(nowInMs: Long): Boolean = {

    val left = nowInMs - lastActivityTimestampInMs
    val right = maxInactivityTimeoutInMs - warningBeforeMaxInMs
    println("********************* now=" + TimeUtil.millisToMinutes(nowInMs) +
      " lastAct=" + TimeUtil.millisToMinutes(lastActivityTimestampInMs) + " **********")
    println("********************* maxInact=" + TimeUtil.millisToMinutes(maxInactivityTimeoutInMs) +
      " warning=" + TimeUtil.millisToMinutes(warningBeforeMaxInMs) + " ************")
    println("********************* " + left + " < " + right + " ***********")
    nowInMs - lastActivityTimestampInMs < maxInactivityTimeoutInMs - warningBeforeMaxInMs
  }

  def isMeetingInactive(nowInMs: Long): Boolean = {
    warningSent && (nowInMs - lastActivityTimestampInMs) > maxInactivityTimeoutInMs
  }

  def timeLeftInMs(nowInMs: Long): Long = {
    lastActivityTimestampInMs + maxInactivityTimeoutInMs - nowInMs
  }
}

case class MeetingExpiryTracker(
    startedOnInMs:                     Long,
    userHasJoined:                     Boolean,
    lastUserLeftOnInMs:                Option[Long],
    durationInMs:                      Long,
    meetingExpireIfNoUserJoinedInMs:   Long,
    meetingExpireWhenLastUserLeftInMs: Long
) {
  def setUserHasJoined(): MeetingExpiryTracker = {
    if (!userHasJoined) {
      copy(userHasJoined = true, lastUserLeftOnInMs = None)
    } else {
      copy(lastUserLeftOnInMs = None)
    }
  }

  def setLastUserLeftOn(timestampInMs: Long): MeetingExpiryTracker = {
    copy(lastUserLeftOnInMs = Some(timestampInMs))
  }

  def hasMeetingExpiredAfterLastUserLeft(timestampInMs: Long): Boolean = {
    val expire = for {
      lastUserLeftOn <- lastUserLeftOnInMs
    } yield {
      timestampInMs - lastUserLeftOn > meetingExpireWhenLastUserLeftInMs
    }

    expire.getOrElse(false)
  }

  def hasMeetingExpired(timestampInMs: Long): (Boolean, Option[String]) = {
    if (hasMeetingExpiredNeverBeenJoined(timestampInMs)) {
      (true, Some(MeetingEndReason.ENDED_WHEN_NOT_JOINED))
    } else if (meetingOverDuration(timestampInMs)) {
      (true, Some(MeetingEndReason.ENDED_AFTER_EXCEEDING_DURATION))
    } else if (hasMeetingExpiredAfterLastUserLeft(timestampInMs)) {
      (true, Some(MeetingEndReason.ENDED_WHEN_LAST_USER_LEFT))
    } else {
      (false, None)
    }
  }

  def hasMeetingExpiredNeverBeenJoined(nowInMs: Long): Boolean = {
    !userHasJoined && (nowInMs - startedOnInMs > meetingExpireIfNoUserJoinedInMs)
  }

  def meetingOverDuration(nowInMs: Long): Boolean = {
    if (durationInMs == 0) {
      false
    } else {
      nowInMs > startedOnInMs + durationInMs
    }
  }

  def endMeetingTime(): Long = {
    startedOnInMs + durationInMs
  }
}

