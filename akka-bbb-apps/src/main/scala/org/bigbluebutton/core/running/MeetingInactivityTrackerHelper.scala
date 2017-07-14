package org.bigbluebutton.core.running

import java.util.concurrent.TimeUnit

import org.bigbluebutton.core.domain.MeetingInactivityTracker
import com.softwaremill.quicklens._
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway

trait MeetingInactivityTrackerHelper {
  def shouldSendInactivityWarning(now: Long, tracker: MeetingInactivityTracker): Boolean = {
    (!tracker.warningSent) &&
      (tracker.lastActivityTime + tracker.maxInactivityTimeoutMinutes) < (now + tracker.warningMinutesBeforeMax)
  }

  def isMeetingActive(now: Long, tracker: MeetingInactivityTracker): Boolean = {
    (now - tracker.lastActivityTime) < tracker.maxInactivityTimeoutMinutes
  }

  def isMeetingInactive(now: Long, tracker: MeetingInactivityTracker): Boolean = {
    (tracker.warningSent) && (now - tracker.lastActivityTime) > tracker.maxInactivityTimeoutMinutes
  }

  def processMeetingInactivityAudit(tracker: MeetingInactivityTracker): MeetingInactivityTracker = {
    val now = System.currentTimeMillis()
    if (isMeetingActive(now, tracker)) {
      tracker
    } else {
      if (isMeetingInactive(now, tracker)) {
        sendMeetingInactive
        endMeeting
      } else {
        warnOfMeetingInactivity(tracker)
      }
    }
  }

  def timeLeftInMinutes(nowInMins: Long, ) : Int = {

  }

  def nowInMinutes() : Long = {
    TimeUnit.MILLISECONDS.toMinutes(System.currentTimeMillis())
  }

  def warnOfMeetingInactivity(now: Long, tracker: MeetingInactivityTracker): MeetingInactivityTracker = {
    if (tracker.warningSent) {
      tracker
    } else {
      val timeLeftSeconds = tracker.lastActivityTime + tracker.maxInactivityTimeoutMinutes - now
      sendMeetingInactivityWarning(props, outGW, timeLeftSeconds)
      tracker.modify(_.warningSent).setTo(true).modify(_.warningSentOn).setTo(System.currentTimeMillis())
    }
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
}
