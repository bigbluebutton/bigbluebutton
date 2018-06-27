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
    inactivityTracker:      MeetingInactivityTracker,
    expiryTracker:          MeetingExpiryTracker
) {

  def update(groupChats: GroupChats): MeetingState2x = copy(groupChats = groupChats)
  def update(presPodManager: PresentationPodManager): MeetingState2x = copy(presentationPodManager = presPodManager)
  def update(breakout: Option[BreakoutModel]): MeetingState2x = copy(breakout = breakout)
  def update(expiry: MeetingExpiryTracker): MeetingState2x = copy(expiryTracker = expiry)
  def update(inactivityTracker: MeetingInactivityTracker): MeetingState2x = copy(inactivityTracker = inactivityTracker)
}

object MeetingEndReason {
  val ENDED_FROM_API = "ENDED_FROM_API"
  val ENDED_DUE_TO_INACTIVITY = "ENDED_DUE_TO_INACTIVITY"
  val ENDED_WHEN_NOT_JOINED = "ENDED_WHEN_NOT_JOINED"
  val ENDED_WHEN_LAST_USER_LEFT = "ENDED_WHEN_LAST_USER_LEFT"
  val ENDED_AFTER_USER_LOGGED_OUT = "ENDED_AFTER_USER_LOGGED_OUT"
  val ENDED_AFTER_EXCEEDING_DURATION = "ENDED_AFTER_EXCEEDING_DURATION"
  val ENDED_BY_PARENT = "ENDED_BY_PARENT"
}
