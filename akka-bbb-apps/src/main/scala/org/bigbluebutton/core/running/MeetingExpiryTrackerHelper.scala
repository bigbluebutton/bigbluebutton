package org.bigbluebutton.core.running

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.{ IncomingEventBus }
import org.bigbluebutton.core.domain.MeetingExpiryTracker
import org.bigbluebutton.core.util.TimeUtil

class MeetingExpiryTrackerHelper(
    val liveMeeting: LiveMeeting,
    val outGW:       OutMessageGateway
)(implicit val context: ActorContext) extends HandlerHelpers {

  val log = Logging(context.system, getClass)

  def hasMeetingExpiredNeverBeenJoined(nowInMinutes: Long, startedOnInMinutes: Long, meetingExpireIfNoUserJoinedInMinutes: Long): Boolean = {
    nowInMinutes - startedOnInMinutes > meetingExpireIfNoUserJoinedInMinutes
  }

  def meetingOverDuration(nowInMinutes: Long, startedOnInMinutes: Long, durationInMinutes: Long): Boolean = {
    nowInMinutes > startedOnInMinutes + durationInMinutes
  }

  def processNeverBeenJoinedExpiry(nowInMinutes: Long, props: DefaultProps, tracker: MeetingExpiryTracker, eventBus: IncomingEventBus): MeetingExpiryTracker = {
    if (hasMeetingExpiredNeverBeenJoined(nowInMinutes, tracker.startedOnInMinutes,
      props.durationProps.meetingExpireIfNoUserJoinedInMinutes)) {
      log.info("Ending meeting as it has never been joined.")
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
      if (props.durationProps.duration != 0 && meetingOverDuration(nowInMinutes, tracker.startedOnInMinutes, props.durationProps.duration)) {
        log.info("Ending meeting as it has passed duration.")
        sendEndMeetingDueToExpiry(props, eventBus)
        tracker
      } else {
        tracker
      }
    }
  }

  def sendEndMeetingDueToExpiry(props: DefaultProps, eventBus: IncomingEventBus): Unit = {

    endMeeting(outGW, liveMeeting)

    if (liveMeeting.props.meetingProp.isBreakout) {
      log.info(
        "Informing parent meeting {} that a breakout room has been ended {}",
        liveMeeting.props.breakoutProps.parentId, liveMeeting.props.meetingProp.intId
      )
      notifyParentThatBreakoutEnded(eventBus, liveMeeting)
    }

    destroyMeeting(eventBus, liveMeeting.props.meetingProp.intId)
  }
}
