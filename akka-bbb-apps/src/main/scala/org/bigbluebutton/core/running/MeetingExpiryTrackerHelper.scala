package org.bigbluebutton.core.running

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.{ MeetingExpiryTracker, MeetingState2x }
import org.bigbluebutton.core.util.TimeUtil

class MeetingExpiryTrackerHelper(
    val liveMeeting: LiveMeeting,
    val outGW:       OutMessageGateway
)(implicit val context: ActorContext) extends HandlerHelpers {

  val log = Logging(context.system, getClass)

  def processNeverBeenJoinedExpiry(nowInSeconds: Long, props: DefaultProps, state: MeetingState2x,
                                   eventBus: IncomingEventBus): MeetingState2x = {
    if (MeetingExpiryTracker.hasMeetingExpiredNeverBeenJoined(state, nowInSeconds)) {
      log.info("Ending meeting as it has never been joined.")
      sendEndMeetingDueToExpiry(props, eventBus)
      state
    } else {
      state
    }
  }

  def processMeetingExpiryAudit(props: DefaultProps, state: MeetingState2x, eventBus: IncomingEventBus): MeetingState2x = {
    val nowInSeconds = TimeUtil.timeNowInSeconds()

    if (!state.expiryTracker.userHasJoined) {
      processNeverBeenJoinedExpiry(nowInSeconds, props, state, eventBus)
    } else {
      if (props.durationProps.duration != 0 && MeetingExpiryTracker.meetingOverDuration(state, nowInSeconds)) {
        log.info("Ending meeting as it has passed duration.")
        sendEndMeetingDueToExpiry(props, eventBus)
        state
      } else {
        state
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
