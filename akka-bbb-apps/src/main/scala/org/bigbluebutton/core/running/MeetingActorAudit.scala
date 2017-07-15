package org.bigbluebutton.core.running

import java.io.{ PrintWriter, StringWriter }

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import scala.concurrent.duration._
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.{ Deadline, FiniteDuration }

object MeetingActorInternal {
  def props(
    props:    DefaultProps,
    eventBus: IncomingEventBus,
    outGW:    OutMessageGateway
  ): Props =
    Props(classOf[MeetingActorInternal], props, eventBus, outGW)
}

// This actor is an internal audit actor for each meeting actor that
// periodically sends messages to the meeting actor
class MeetingActorInternal(
  val props:    DefaultProps,
  val eventBus: IncomingEventBus, val outGW: OutMessageGateway
)
    extends Actor with ActorLogging with SystemConfiguration with AuditHelpers {

  object AuditMonitorInternalMsg

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on MeetingActorInternal, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  private def getExpireNeverJoined(): Int = {
    val time = expireNeverJoined
    log.debug("ExpireNeverJoined: {} seconds", time)
    time
  }

  private def getExpireLastUserLeft(): Int = {
    val time = expireLastUserLeft
    log.debug("ExpireLastUserLeft: {} seconds", time)
    time
  }

  private val MonitorFrequency = 10 seconds

  private val ExpireMeetingDuration = FiniteDuration(props.durationProps.duration, "minutes")
  private val ExpireMeetingNeverJoined = FiniteDuration(getExpireNeverJoined(), "seconds")
  private val ExpireMeetingLastUserLeft = FiniteDuration(getExpireLastUserLeft(), "seconds")
  private var meetingExpire: Option[Deadline] = Some(ExpireMeetingNeverJoined.fromNow)
  // Zero minutes means the meeting has no duration control
  private var meetingDuration: Option[Deadline] = if (ExpireMeetingDuration > (0 minutes)) Some(ExpireMeetingDuration.fromNow) else None

  context.system.scheduler.schedule(5 seconds, MonitorFrequency, self, AuditMonitorInternalMsg)

  // Query to get voice conference users
  getUsersInVoiceConf(props, outGW)

  if (props.meetingProp.isBreakout) {
    // This is a breakout room. Inform our parent meeting that we have been successfully created.
    sendBreakoutRoomCreatedToParent(props, eventBus)
  }

  def receive = {
    case AuditMonitorInternalMsg         => handleMonitor()
    case msg: UpdateMeetingExpireMonitor => handleUpdateMeetingExpireMonitor(msg)
    case msg: Object                     => handleMessage(msg)
  }

  def handleMonitor() {
    handleMonitorNumberOfWebUsers()
    handleMonitorExpiration()
  }

  def handleMessage(msg: Object) {

  }

  def handleMonitorNumberOfWebUsers() {
    eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, MonitorNumberOfUsers(props.meetingProp.intId)))

    // Trigger updating users of time remaining on meeting.
    eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, SendTimeRemainingUpdate(props.meetingProp.intId)))

    if (props.meetingProp.isBreakout) {
      // This is a breakout room. Update the main meeting with list of users in this breakout room.
      eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, SendBreakoutUsersUpdate(props.meetingProp.intId)))
    }

  }

  private def handleMonitorExpiration() {
    for {
      mExpire <- meetingExpire
    } yield {
      if (mExpire.isOverdue()) {
        // User related meeting expiration methods
        log.debug("Meeting {} expired. No users", props.meetingProp.intId)
        meetingExpire = None
        eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, EndMeeting(props.meetingProp.intId)))
      }
    }

    for {
      mDuration <- meetingDuration
    } yield {
      if (mDuration.isOverdue()) {
        // Default meeting duration
        meetingDuration = None
        log.debug("Meeting {} expired. Reached it's fixed duration of {}", props.meetingProp.intId, ExpireMeetingDuration.toString())
        eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, EndMeeting(props.meetingProp.intId)))
      }
    }
  }

  private def handleUpdateMeetingExpireMonitor(msg: UpdateMeetingExpireMonitor) {
    if (msg.hasUser) {
      meetingExpire match {
        case Some(mExpire) =>
          log.debug("Meeting has users. Stopping expiration for meeting {}", props.meetingProp.intId)
          meetingExpire = None
        case None =>
          // User list is empty. Start this meeting expiration method
          log.debug("Meeting has no users. Starting {} expiration for meeting {}", ExpireMeetingLastUserLeft.toString(), props.meetingProp.intId)
          meetingExpire = Some(ExpireMeetingLastUserLeft.fromNow)
      }
    }
  }

}
