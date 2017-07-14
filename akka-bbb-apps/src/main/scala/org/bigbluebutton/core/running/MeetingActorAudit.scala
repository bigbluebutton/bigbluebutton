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
import org.bigbluebutton.common2.msgs._
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

  private def getInactivityDeadline(): Int = {
    val time = getMetadata(Metadata.INACTIVITY_DEADLINE, props.metadataProp.metadata) match {
      case Some(result) => result.asInstanceOf[Int]
      case None         => inactivityDeadline
    }
    log.debug("InactivityDeadline: {} seconds", time)
    time
  }

  private def getInactivityTimeLeft(): Int = {
    val time = getMetadata(Metadata.INACTIVITY_TIMELEFT, props.metadataProp.metadata) match {
      case Some(result) => result.asInstanceOf[Int]
      case None         => inactivityTimeLeft
    }
    log.debug("InactivityTimeLeft: {} seconds", time)
    time
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

  private val InactivityDeadline = FiniteDuration(getInactivityDeadline(), "seconds")
  private val InactivityTimeLeft = FiniteDuration(getInactivityTimeLeft(), "seconds")
  private var inactivityDeadlineTime = InactivityDeadline.fromNow
  private var inactivityWarning: Option[Deadline] = None

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
    handleMonitorActivity()
    handleMonitorNumberOfWebUsers()
    handleMonitorExpiration()
  }

  def handleMessage(msg: Object) {
    if (isMeetingActivity(msg)) {
      notifyActivity()
    }
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

  private def handleMonitorActivity() {

    inactivityWarning match {
      case Some(iw) =>
        if (inactivityDeadlineTime.isOverdue() && iw.isOverdue()) {
          log.info("Closing meeting {} due to inactivity for {} seconds", props.meetingProp.intId, InactivityDeadline.toSeconds)
          pushInactivityDeadline()
          eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, EndMeeting(props.meetingProp.intId)))
          // Or else make sure to send only one warning message
        }
      case None =>
        if (inactivityDeadlineTime.isOverdue()) {
          log.info("Sending inactivity warning to meeting {}", props.meetingProp.intId)

          sendMeetingInactivityWarning(props, outGW, InactivityTimeLeft.toSeconds)

          // We add 5 seconds so clients will have enough time to process the message
          inactivityWarning = Some((InactivityTimeLeft + (5 seconds)).fromNow)
        }
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

  private def pushInactivityDeadline() {
    inactivityDeadlineTime = InactivityDeadline.fromNow
    inactivityWarning = None
  }

  private def notifyActivity() {
    for {
      _ <- inactivityWarning
    } yield {
      sendMeetingIsActive(props, outGW)
    }

    pushInactivityDeadline()
  }

  private def handleActivityResponse(msg: ActivityResponse) {
    log.info("User endorsed that meeting {} is active", props.meetingProp.intId)
    pushInactivityDeadline()
    sendMeetingIsActive(props, outGW)
  }

  private def isMeetingActivity(msg: Object): Boolean = {
    // We need to avoid all internal system's messages
    msg match {
      case msg: MonitorNumberOfUsers    => false
      case msg: SendTimeRemainingUpdate => false
      case msg: SendBreakoutUsersUpdate => false
      case msg: BreakoutRoomCreated     => false
      case _                            => true
    }
  }

  def getMetadata(key: String, metadata: collection.immutable.Map[String, String]): Option[Object] = {
    var value: Option[String] = None
    if (metadata.contains(key)) {
      value = metadata.get(key)
    }

    value match {
      case Some(v) =>
        key match {
          case Metadata.INACTIVITY_DEADLINE =>
            // Can be defined between 1 minute to 6 hours
            metadataIntegerValueOf(v, 60, 21600) match {
              case Some(r) => Some(r.asInstanceOf[Object])
              case None    => None
            }

          case Metadata.INACTIVITY_TIMELEFT =>
            // Can be defined between 30 seconds to 30 minutes
            metadataIntegerValueOf(v, 30, 1800) match {
              case Some(r) => Some(r.asInstanceOf[Object])
              case None    => None
            }

          case _ => None
        }

      case None => None
    }
  }

  private def metadataIntegerValueOf(value: String, lowerBound: Int, upperBound: Int): Option[Int] = {
    stringToInt(value) match {
      case Some(r) =>
        if (lowerBound <= r && r <= upperBound) {
          Some(r)
        } else {
          None
        }

      case None => None
    }
  }

  private def stringToInt(value: String): Option[Int] = {
    var result: Option[Int] = None
    try {
      result = Some(Integer.parseInt(value))
    } catch {
      case e: Exception => {
        result = None
      }
    }
    result
  }
}
