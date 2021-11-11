package org.bigbluebutton.core.domain

import org.bigbluebutton.core.apps.BreakoutModel
import org.bigbluebutton.core.models.GroupChats
import org.bigbluebutton.core.models.PresentationPodManager

object MeetingState2x {

}

case class MeetingState2x(
    groupChats:             GroupChats,
    presentationPodManager: PresentationPodManager,
    breakout:               Option[BreakoutModel],
    lastBreakout:           Option[BreakoutModel],
    expiryTracker:          MeetingExpiryTracker,
    recordingTracker:       MeetingRecordingTracker
) {

  def update(groupChats: GroupChats): MeetingState2x = copy(groupChats = groupChats)
  def update(presPodManager: PresentationPodManager): MeetingState2x = copy(presentationPodManager = presPodManager)
  def update(breakout: Option[BreakoutModel]): MeetingState2x = {
    breakout match {
      case Some(b) => {
        if (b.hasAllStarted()) copy(breakout = breakout, lastBreakout = breakout)
        else copy(breakout = breakout)
      }
      case None => copy(breakout = breakout)
    }
  }
  def update(expiry: MeetingExpiryTracker): MeetingState2x = copy(expiryTracker = expiry)
  def update(recordingTracker: MeetingRecordingTracker): MeetingState2x = copy(recordingTracker = recordingTracker)
}

object MeetingEndReason {
  val ENDED_FROM_API = "ENDED_FROM_API"
  val ENDED_WHEN_NOT_JOINED = "ENDED_WHEN_NOT_JOINED"
  val ENDED_WHEN_LAST_USER_LEFT = "ENDED_WHEN_LAST_USER_LEFT"
  val ENDED_AFTER_USER_LOGGED_OUT = "ENDED_AFTER_USER_LOGGED_OUT"
  val ENDED_AFTER_EXCEEDING_DURATION = "ENDED_AFTER_EXCEEDING_DURATION"
  val BREAKOUT_ENDED_EXCEEDING_DURATION = "BREAKOUT_ENDED_EXCEEDING_DURATION"
  val BREAKOUT_ENDED_BY_MOD = "BREAKOUT_ENDED_BY_MOD"
  val ENDED_DUE_TO_NO_AUTHED_USER = "ENDED_DUE_TO_NO_AUTHED_USER"
  val ENDED_DUE_TO_NO_MODERATOR = "ENDED_DUE_TO_NO_MODERATOR"
}
