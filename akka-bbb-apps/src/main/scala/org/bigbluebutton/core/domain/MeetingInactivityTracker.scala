package org.bigbluebutton.core.domain

import com.softwaremill.quicklens._
import org.bigbluebutton.core.util.TimeUtil

case class MeetingInactivityTracker(
  val maxInactivityTimeoutMinutes: Int,
  val warningMinutesBeforeMax:     Int,
  lastActivityTimestamp:           Long,
  warningSent:                     Boolean,
  warningSentOnTimestamp:          Long
)

object MeetingInactivityTracker {

  def warningHasBeenSent(state: MeetingState2x): Boolean = {
    state.inactivityTracker.warningSent
  }

  def setWarningSentAndTimestamp(state: MeetingState2x, nowInSeconds: Long): MeetingState2x = {
    val tracker = state.inactivityTracker.modify(_.warningSent).setTo(true)
      .modify(_.warningSentOnTimestamp).setTo(nowInSeconds)
    state.modify(_.inactivityTracker).setTo(tracker)
  }

  def resetWarningSentAndTimestamp(state: MeetingState2x): MeetingState2x = {
    val tracker = state.inactivityTracker.modify(_.warningSent).setTo(false)
      .modify(_.warningSentOnTimestamp).setTo(0L)
    state.modify(_.inactivityTracker).setTo(tracker)
  }

  def updateLastActivityTimestamp(state: MeetingState2x, nowInSeconds: Long): MeetingState2x = {
    val tracker = state.inactivityTracker.modify(_.lastActivityTimestamp).setTo(nowInSeconds)
    state.modify(_.inactivityTracker).setTo(tracker)
  }

  def hasRecentActivity(state: MeetingState2x, nowInSeconds: Long): Boolean = {
    nowInSeconds - state.inactivityTracker.lastActivityTimestamp <
      TimeUtil.minutesToSeconds(state.inactivityTracker.maxInactivityTimeoutMinutes) -
      TimeUtil.minutesToSeconds(state.inactivityTracker.warningMinutesBeforeMax)
  }

  def isMeetingInactive(state: MeetingState2x, nowInSeconds: Long): Boolean = {
    state.inactivityTracker.warningSent &&
      (nowInSeconds - state.inactivityTracker.lastActivityTimestamp) >
      TimeUtil.minutesToSeconds(state.inactivityTracker.maxInactivityTimeoutMinutes)
  }

  def timeLeftInSeconds(state: MeetingState2x, nowInSeconds: Long): Long = {
    state.inactivityTracker.lastActivityTimestamp +
      TimeUtil.minutesToSeconds(state.inactivityTracker.maxInactivityTimeoutMinutes) - nowInSeconds
  }
}

case class MeetingExpiryTracker(
  startedOn:                              Long,
  userHasJoined:                          Boolean,
  lastUserLeftOn:                         Option[Long],
  durationInMinutes:                      Int,
  meetingExpireIfNoUserJoinedInMinutes:   Int,
  meetingExpireWhenLastUserLeftInMinutes: Int
)

object MeetingExpiryTracker {
  def setMeetingStartedOn(state: MeetingState2x, timestampInSeconds: Long): MeetingState2x = {
    val tracker = state.expiryTracker.modify(_.startedOn).setTo(timestampInSeconds)
    state.modify(_.expiryTracker).setTo(tracker)
  }

  def setUserHasJoined(state: MeetingState2x): MeetingState2x = {
    val tracker = state.expiryTracker.modify(_.userHasJoined).setTo(true)
      .modify(_.lastUserLeftOn).setTo(None)
    state.modify(_.expiryTracker).setTo(tracker)
  }

  def hasMeetingExpiredAfterLastUserLeft(state: MeetingState2x, timestampInSeconds: Long): Boolean = {
    val expire = for {
      lastUserLeftOn <- state.expiryTracker.lastUserLeftOn
    } yield {
      timestampInSeconds - lastUserLeftOn >
        TimeUtil.minutesToSeconds(state.expiryTracker.meetingExpireWhenLastUserLeftInMinutes)
    }

    expire.getOrElse(false)
  }

  def setLastUserLeftOn(state: MeetingState2x, timestampInSeconds: Long): MeetingState2x = {
    val tracker = state.expiryTracker.modify(_.lastUserLeftOn).setTo(Some(timestampInSeconds))
    state.modify(_.expiryTracker).setTo(tracker)
  }

  def hasMeetingExpiredNeverBeenJoined(state: MeetingState2x, nowInSeconds: Long): Boolean = {
    !state.expiryTracker.userHasJoined &&
      (nowInSeconds - state.expiryTracker.startedOn >
        TimeUtil.minutesToSeconds(state.expiryTracker.meetingExpireIfNoUserJoinedInMinutes))
  }

  def meetingOverDuration(state: MeetingState2x, nowInSeconds: Long): Boolean = {
    if (state.expiryTracker.durationInMinutes == 0) {
      false
    } else {
      nowInSeconds > state.expiryTracker.startedOn + TimeUtil.minutesToSeconds(state.expiryTracker.durationInMinutes)
    }
  }

  def endMeetingTime(state: MeetingState2x): Int = {
    (state.expiryTracker.startedOn + TimeUtil.minutesToSeconds(state.expiryTracker.durationInMinutes)).toInt
  }
}

