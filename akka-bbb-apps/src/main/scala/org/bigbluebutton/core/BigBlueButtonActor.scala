package org.bigbluebutton.core

import java.io.{ PrintWriter, StringWriter }

import akka.actor._
import akka.actor.ActorLogging
import akka.actor.SupervisorStrategy.Resume
import akka.util.Timeout

import scala.concurrent.duration._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api._
import org.bigbluebutton.SystemConfiguration
import java.util.concurrent.TimeUnit

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.RunningMeeting
import org.bigbluebutton.core2.RunningMeetings
import org.bigbluebutton.core2.message.senders.MsgBuilder

object BigBlueButtonActor extends SystemConfiguration {
  def props(
    system:    ActorSystem,
    eventBus:  InternalEventBus,
    bbbMsgBus: BbbMsgRouterEventBus,
    outGW:     OutMessageGateway
  ): Props =
    Props(classOf[BigBlueButtonActor], system, eventBus, bbbMsgBus, outGW)
}

class BigBlueButtonActor(
  val system:   ActorSystem,
  val eventBus: InternalEventBus, val bbbMsgBus: BbbMsgRouterEventBus,
  val outGW: OutMessageGateway
) extends Actor
    with ActorLogging with SystemConfiguration {

  implicit def executionContext = system.dispatcher
  implicit val timeout = Timeout(5 seconds)

  private val meetings = new RunningMeetings

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on BigBlueButtonActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  override def preStart() {
    bbbMsgBus.subscribe(self, meetingManagerChannel)
  }

  override def postStop() {
    bbbMsgBus.unsubscribe(self, meetingManagerChannel)
  }

  def receive = {
    // Internal messages
    case msg: DestroyMeetingInternalMsg => handleDestroyMeeting(msg)

    // 2x messages
    case msg: BbbCommonEnvCoreMsg       => handleBbbCommonEnvCoreMsg(msg)
    case _                              => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: CreateMeetingReqMsg      => handleCreateMeetingReqMsg(m)
      case m: RegisterUserReqMsg       => handleRegisterUserReqMsg(m)
      case m: EjectDuplicateUserReqMsg => handleEjectDuplicateUserReqMsg(m)
      case m: GetAllMeetingsReqMsg     => handleGetAllMeetingsReqMsg(m)
      case m: CheckAlivePingSysMsg     => handleCheckAlivePingSysMsg(m)
      case _                           => log.warning("Cannot handle " + msg.envelope.name)
    }
  }

  def handleRegisterUserReqMsg(msg: RegisterUserReqMsg): Unit = {
    log.debug("RECEIVED RegisterUserReqMsg msg {}", msg)
    for {
      m <- RunningMeetings.findWithId(meetings, msg.header.meetingId)
    } yield {
      log.debug("FORWARDING Register user message")
      m.actorRef forward (msg)
    }
  }

  def handleEjectDuplicateUserReqMsg(msg: EjectDuplicateUserReqMsg): Unit = {
    log.debug("RECEIVED EjectDuplicateUserReqMsg msg {}", msg)
    for {
      m <- RunningMeetings.findWithId(meetings, msg.header.meetingId)
    } yield {
      log.debug("FORWARDING EjectDuplicateUserReqMsg")
      m.actorRef forward (msg)
    }
  }

  def handleCreateMeetingReqMsg(msg: CreateMeetingReqMsg): Unit = {
    log.debug("RECEIVED CreateMeetingReqMsg msg {}", msg)

    RunningMeetings.findWithId(meetings, msg.body.props.meetingProp.intId) match {
      case None =>
        log.info("Create meeting request. meetingId={}", msg.body.props.meetingProp.intId)

        val m = RunningMeeting(msg.body.props, outGW, eventBus)

        /** Subscribe to meeting and voice events. **/
        eventBus.subscribe(m.actorRef, m.props.meetingProp.intId)
        eventBus.subscribe(m.actorRef, m.props.voiceProp.voiceConf)
        eventBus.subscribe(m.actorRef, m.props.screenshareProps.screenshareConf)

        bbbMsgBus.subscribe(m.actorRef, m.props.meetingProp.intId)
        bbbMsgBus.subscribe(m.actorRef, m.props.voiceProp.voiceConf)
        bbbMsgBus.subscribe(m.actorRef, m.props.screenshareProps.screenshareConf)

        RunningMeetings.add(meetings, m)

        // Send new 2x message
        val msgEvent = MsgBuilder.buildMeetingCreatedEvtMsg(m.props.meetingProp.intId, msg.body.props)
        m.outMsgRouter.send(msgEvent)

      case Some(m) =>
        log.info("Meeting already created. meetingID={}", msg.body.props.meetingProp.intId)
      // do nothing

    }

  }

  private def handleGetAllMeetingsReqMsg(msg: GetAllMeetingsReqMsg): Unit = {
    RunningMeetings.meetings(meetings).foreach(m => {
      m.actorRef ! msg
    })
  }

  private def handleCheckAlivePingSysMsg(msg: CheckAlivePingSysMsg): Unit = {
    val event = MsgBuilder.buildCheckAlivePingSysMsg(msg.body.system, msg.body.timestamp)
    outGW.send(event)
  }

  private def handleDestroyMeeting(msg: DestroyMeetingInternalMsg): Unit = {

    for {
      m <- RunningMeetings.findWithId(meetings, msg.meetingId)
      m2 <- RunningMeetings.remove(meetings, msg.meetingId)
    } yield {
      /** Unsubscribe to meeting and voice events. **/
      eventBus.unsubscribe(m.actorRef, m.props.meetingProp.intId)
      eventBus.unsubscribe(m.actorRef, m.props.voiceProp.voiceConf)
      eventBus.unsubscribe(m.actorRef, m.props.screenshareProps.screenshareConf)

      bbbMsgBus.unsubscribe(m.actorRef, m.props.meetingProp.intId)
      bbbMsgBus.unsubscribe(m.actorRef, m.props.voiceProp.voiceConf)
      bbbMsgBus.unsubscribe(m.actorRef, m.props.screenshareProps.screenshareConf)

      // Delay sending DisconnectAllUsers to allow messages to reach the client
      // before the connections are closed.
      context.system.scheduler.scheduleOnce(Duration.create(2500, TimeUnit.MILLISECONDS)) {
        // Disconnect all clients

        val disconnectEvnt = MsgBuilder.buildDisconnectAllClientsSysMsg(msg.meetingId, "meeting-destroyed")
        m2.outMsgRouter.send(disconnectEvnt)

        val stopTranscodersCmd = MsgBuilder.buildStopMeetingTranscodersSysCmdMsg(msg.meetingId)
        m2.outMsgRouter.send(stopTranscodersCmd)

        log.info("Destroyed meetingId={}", msg.meetingId)
        val destroyedEvent = MsgBuilder.buildMeetingDestroyedEvtMsg(msg.meetingId)
        m2.outMsgRouter.send(destroyedEvent)

        // Stop the meeting actor.
        context.stop(m.actorRef)
      }
    }
  }

}
