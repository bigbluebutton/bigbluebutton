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
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, InternalEventBus }

import scala.concurrent.ExecutionContext.Implicits.global

object MeetingActorAudit {
  def props(
      props:    DefaultProps,
      eventBus: InternalEventBus,
      outGW:    OutMsgRouter
  ): Props =
    Props(classOf[MeetingActorAudit], props, eventBus, outGW)
}

// This actor is an internal audit actor for each meeting actor that
// periodically sends messages to the meeting actor
class MeetingActorAudit(
    val props:    DefaultProps,
    val eventBus: InternalEventBus, val outGW: OutMsgRouter
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

  private val MonitorFrequency = 10 seconds

  context.system.scheduler.schedule(5 seconds, MonitorFrequency, self, AuditMonitorInternalMsg)

  // Query to get voice conference users
  getUsersInVoiceConf(props, outGW)

  if (props.meetingProp.isBreakout) {
    // This is a breakout room. Inform our parent meeting that we have been successfully created.
    eventBus.publish(BigBlueButtonEvent(
      props.breakoutProps.parentId,
      BreakoutRoomCreatedInternalMsg(props.breakoutProps.parentId, props.meetingProp.intId)
    ))

  }

  def receive = {
    case AuditMonitorInternalMsg => handleMonitor()
  }

  def handleMonitor() {
    handleMonitorNumberOfWebUsers()
  }

  def handleMonitorNumberOfWebUsers() {
    eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, MonitorNumberOfUsersInternalMsg(props.meetingProp.intId)))

    // Trigger updating users of time remaining on meeting.
    eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, SendTimeRemainingAuditInternalMsg(props.meetingProp.intId)))

    // This is a breakout room. Update the main meeting with list of users in this breakout room.
    eventBus.publish(BigBlueButtonEvent(
      props.meetingProp.intId,
      SendBreakoutUsersAuditInternalMsg(props.breakoutProps.parentId, props.meetingProp.intId)
    ))

    // Trigger recording timer, only for meeting allowing recording
    if (props.recordProp.record) {
      eventBus.publish(BigBlueButtonEvent(props.meetingProp.intId, SendRecordingTimerInternalMsg(props.meetingProp.intId)))
    }
  }

}
