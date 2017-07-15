package org.bigbluebutton.core.running

import org.bigbluebutton.core.domain.MeetingInactivityTracker
import com.softwaremill.quicklens._
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.EndMeeting
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }
import org.bigbluebutton.core.util.TimeUtil

object MeetingInactivityTrackerHelper {

  def isMeetingActive(
    nowInMinutes:                Long,
    lastActivityTimeInMinutes:   Long,
    maxInactivityTimeoutMinutes: Long
  ): Boolean = {
    nowInMinutes - lastActivityTimeInMinutes < maxInactivityTimeoutMinutes
  }

  def isMeetingInactive(
    warningSent:                 Boolean,
    nowInMinutes:                Long,
    lastActivityTimeInMinutes:   Long,
    maxInactivityTimeoutMinutes: Long
  ): Boolean = {
    warningSent && (nowInMinutes - lastActivityTimeInMinutes) > maxInactivityTimeoutMinutes
  }

  def processMeetingInactivityAudit(
    props:    DefaultProps,
    outGW:    OutMessageGateway,
    eventBus: IncomingEventBus,
    tracker:  MeetingInactivityTracker
  ): MeetingInactivityTracker = {

    val nowInMinutes = TimeUtil.millisToMinutes(System.currentTimeMillis())
    if (isMeetingActive(nowInMinutes, tracker.lastActivityTimeInMinutes, tracker.maxInactivityTimeoutMinutes)) {
      tracker
    } else {
      if (isMeetingInactive(tracker.warningSent, nowInMinutes,
        tracker.lastActivityTimeInMinutes,
        tracker.maxInactivityTimeoutMinutes)) {
        sendEndMeetingDueToInactivity(props, eventBus)
        tracker
      } else {
        if (tracker.warningSent) {
          tracker
        } else {
          warnOfMeetingInactivity(props, outGW, nowInMinutes, tracker)
          tracker.modify(_.warningSent).setTo(true).modify(_.warningSentOnTimeInMinutes).setTo(nowInMinutes)
        }
      }
    }
  }

  def timeLeftInMinutes(nowInMinutes: Long, tracker: MeetingInactivityTracker): Long = {
    tracker.lastActivityTimeInMinutes + tracker.maxInactivityTimeoutMinutes - nowInMinutes
  }

  def warnOfMeetingInactivity(props: DefaultProps, outGW: OutMessageGateway,
                              nowInMinutes: Long, tracker: MeetingInactivityTracker): MeetingInactivityTracker = {
    val timeLeftSeconds = TimeUtil.minutesToSeconds(timeLeftInMinutes(nowInMinutes, tracker))
    sendMeetingInactivityWarning(props, outGW, timeLeftSeconds)
    tracker
  }

  def sendEndMeetingDueToInactivity(props: DefaultProps, eventBus: IncomingEventBus): Unit = {
    eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, EndMeeting(props.meetingProp.intId)))
  }

  def sendMeetingInactivityWarning(props: DefaultProps, outGW: OutMessageGateway, timeLeftSeconds: Long): Unit = {
    def build(meetingId: String, timeLeftInSec: Long): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingInactivityWarningEvtMsg.NAME, routing)
      val body = MeetingInactivityWarningEvtMsgBody(timeLeftInSec)
      val header = BbbClientMsgHeader(MeetingInactivityWarningEvtMsg.NAME, meetingId, "not-used")
      val event = MeetingInactivityWarningEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val event = build(props.meetingProp.intId, timeLeftSeconds)
    outGW.send(event)
  }

  def processMeetingActivityResponse(
    props:   DefaultProps,
    outGW:   OutMessageGateway,
    msg:     MeetingActivityResponseCmdMsg,
    tracker: MeetingInactivityTracker
  ): MeetingInactivityTracker = {

    def buildMeetingIsActiveEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
      val envelope = BbbCoreEnvelope(MeetingIsActiveEvtMsg.NAME, routing)
      val body = MeetingIsActiveEvtMsgBody(meetingId)
      val header = BbbClientMsgHeader(MeetingIsActiveEvtMsg.NAME, meetingId, "not-used")
      val event = MeetingIsActiveEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val event = buildMeetingIsActiveEvtMsg(props.meetingProp.intId)
    outGW.send(event)

    tracker.modify(_.warningSent).setTo(false)
      .modify(_.warningSentOnTimeInMinutes).setTo(0L)
      .modify(_.lastActivityTimeInMinutes).setTo(System.currentTimeMillis())
  }
}
