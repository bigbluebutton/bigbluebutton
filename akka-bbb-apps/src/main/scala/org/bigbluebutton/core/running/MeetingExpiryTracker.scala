package org.bigbluebutton.core.running

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.api.EndMeeting
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }
import org.bigbluebutton.core.domain.MeetingExpiryTracker
import org.bigbluebutton.core.util.TimeUtil

object MeetingExpiryTracker {

  def hasMeetingExpiredNeverBeenJoined(nowInMinutes: Long, startedOnInMinutes: Long, meetingExpireIfNoUserJoinedInMinutes: Long): Boolean = {
    nowInMinutes - startedOnInMinutes > meetingExpireIfNoUserJoinedInMinutes
  }

  def meetingOverDuration(nowInMinutes: Long, startedOnInMinutes: Long, durationInMinutes: Long): Boolean = {
    nowInMinutes > startedOnInMinutes + durationInMinutes
  }

  def processNeverBeenJoinedExpiry(nowInMinutes: Long, props: DefaultProps, tracker: MeetingExpiryTracker, eventBus: IncomingEventBus): MeetingExpiryTracker = {
    if (hasMeetingExpiredNeverBeenJoined(nowInMinutes, tracker.startedOnInMinutes,
      props.durationProps.meetingExpireIfNoUserJoinedInMinutes)) {
      sendEndMeetingDueToExpiry(props, eventBus)
      tracker
    } else {
      tracker
    }
  }

  def processMeetingExpiryAudit(props: DefaultProps, tracker: MeetingExpiryTracker, eventBus: IncomingEventBus): MeetingExpiryTracker = {
    val nowInMinutes = TimeUtil.millisToMinutes(System.currentTimeMillis())

    if (!tracker.meetingJoined) {
      processNeverBeenJoinedExpiry(nowInMinutes, props, tracker, eventBus)
    } else {
      if (meetingOverDuration(nowInMinutes, tracker.startedOnInMinutes, props.durationProps.duration)) {
        sendEndMeetingDueToExpiry(props, eventBus)
        tracker
      } else {
        tracker
      }
    }
  }

  def sendEndMeetingDueToExpiry(props: DefaultProps, eventBus: IncomingEventBus): Unit = {
    eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, EndMeeting(props.meetingProp.intId)))
  }
}
