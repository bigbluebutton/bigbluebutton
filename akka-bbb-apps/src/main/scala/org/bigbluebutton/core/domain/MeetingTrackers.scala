package org.bigbluebutton.core.domain

case class MeetingExpiryTracker(
    startedOnInMs:                     Long,
    userHasJoined:                     Boolean,
    moderatorHasJoined:                Boolean,
    isBreakout:                        Boolean,
    lastUserLeftOnInMs:                Option[Long],
    lastModeratorLeftOnInMs:           Long,
    durationInMs:                      Long,
    meetingExpireIfNoUserJoinedInMs:   Long,
    meetingExpireWhenLastUserLeftInMs: Long,
    userInactivityInspectTimerInMs:    Long,
    userInactivityThresholdInMs:       Long,
    userActivitySignResponseDelayInMs: Long,
    endWhenNoModerator:                Boolean,
    endWhenNoModeratorDelayInMs:       Long
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

  def setModeratorHasJoined(): MeetingExpiryTracker = {
    if (!moderatorHasJoined) {
      copy(moderatorHasJoined = true, lastModeratorLeftOnInMs = 0)
    } else {
      copy(lastModeratorLeftOnInMs = 0)
    }
  }

  def setLastModeratorLeftOn(timestampInMs: Long): MeetingExpiryTracker = {
    copy(lastModeratorLeftOnInMs = timestampInMs)
  }

  def hasMeetingExpiredAfterLastUserLeft(timestampInMs: Long): Boolean = {
    val expire = for {
      lastUserLeftOn <- lastUserLeftOnInMs
    } yield {
      // Check if we need to end meeting right away when the last user left
      // ralam Nov 16, 2018
      if (meetingExpireWhenLastUserLeftInMs == 0) true
      else timestampInMs - lastUserLeftOn > meetingExpireWhenLastUserLeftInMs
    }

    expire.getOrElse(false)
  }

  def hasMeetingExpired(timestampInMs: Long): (Boolean, Option[String]) = {
    if (hasMeetingExpiredNeverBeenJoined(timestampInMs) && !isBreakout) {
      (true, Some(MeetingEndReason.ENDED_WHEN_NOT_JOINED))
    } else if (meetingOverDuration(timestampInMs)) {
      (true, Some(MeetingEndReason.ENDED_AFTER_EXCEEDING_DURATION))
    } else if (hasMeetingExpiredAfterLastUserLeft(timestampInMs) && !isBreakout) {
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

case class MeetingRecordingTracker(
    startedOnInMs:        Long,
    previousDurationInMs: Long,
    currentDurationInMs:  Long
) {

  def startTimer(nowInMs: Long): MeetingRecordingTracker = {
    copy(startedOnInMs = nowInMs)
  }

  def pauseTimer(nowInMs: Long): MeetingRecordingTracker = {
    copy(currentDurationInMs = 0L, previousDurationInMs = previousDurationInMs + nowInMs - startedOnInMs, startedOnInMs = 0L)
  }

  def resetTimer(nowInMs: Long): MeetingRecordingTracker = {
    copy(startedOnInMs = nowInMs, previousDurationInMs = 0L, currentDurationInMs = 0L)
  }

  def udpateCurrentDuration(nowInMs: Long): MeetingRecordingTracker = {
    copy(currentDurationInMs = nowInMs - startedOnInMs)
  }

  def recordingDuration(): Long = {
    currentDurationInMs + previousDurationInMs
  }

}

