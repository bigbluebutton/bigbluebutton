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
import org.bigbluebutton.core.util.ColorPicker
import org.bigbluebutton.core2.RunningMeetings
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.service.HealthzService

object BigBlueButtonActor extends SystemConfiguration {
  def props(
      system:         ActorSystem,
      eventBus:       InternalEventBus,
      bbbMsgBus:      BbbMsgRouterEventBus,
      outGW:          OutMessageGateway,
      healthzService: HealthzService
  ): Props =
    Props(classOf[BigBlueButtonActor], system, eventBus, bbbMsgBus, outGW, healthzService)
}

class BigBlueButtonActor(
    val system:   ActorSystem,
    val eventBus: InternalEventBus, val bbbMsgBus: BbbMsgRouterEventBus,
    val outGW:          OutMessageGateway,
    val healthzService: HealthzService
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

      case m: CreateMeetingReqMsg         => handleCreateMeetingReqMsg(m)
      case m: RegisterUserReqMsg          => handleRegisterUserReqMsg(m)
      case m: GetAllMeetingsReqMsg        => handleGetAllMeetingsReqMsg(m)
      case m: GetRunningMeetingsReqMsg    => handleGetRunningMeetingsReqMsg(m)
      case m: CheckAlivePingSysMsg        => handleCheckAlivePingSysMsg(m)
      case m: ValidateConnAuthTokenSysMsg => handleValidateConnAuthTokenSysMsg(m)
      case _                              => log.warning("Cannot handle " + msg.envelope.name)
    }
  }

  def handleValidateConnAuthTokenSysMsg(msg: ValidateConnAuthTokenSysMsg): Unit = {
    RunningMeetings.findWithId(meetings, msg.body.meetingId) match {
      case Some(meeting) =>
        meeting.actorRef forward msg

      case None =>
        val event = MsgBuilder.buildValidateConnAuthTokenSysRespMsg(msg.body.meetingId, msg.body.userId,
          false, msg.body.connId, msg.body.app)
        outGW.send(event)
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

  def handleCreateMeetingReqMsg(msg: CreateMeetingReqMsg): Unit = {
    log.debug("RECEIVED CreateMeetingReqMsg msg {}", msg)

    RunningMeetings.findWithId(meetings, msg.body.props.meetingProp.intId) match {
      case None =>
        log.info("Create meeting request. meetingId={}", msg.body.props.meetingProp.intId)

        val m = RunningMeeting(msg.body.props, outGW, eventBus)

        // Subscribe to meeting and voice events.
        eventBus.subscribe(m.actorRef, m.props.meetingProp.intId)
        eventBus.subscribe(m.actorRef, m.props.voiceProp.voiceConf)

        bbbMsgBus.subscribe(m.actorRef, m.props.meetingProp.intId)
        bbbMsgBus.subscribe(m.actorRef, m.props.voiceProp.voiceConf)

        RunningMeetings.add(meetings, m)

      case Some(m) =>
        log.info("Meeting already created. meetingID={}", msg.body.props.meetingProp.intId)
      // do nothing

    }
  }

  private def handleGetRunningMeetingsReqMsg(msg: GetRunningMeetingsReqMsg): Unit = {
    val liveMeetings = RunningMeetings.meetings(meetings)
    val meetingIds = liveMeetings.map(m => m.props.meetingProp.intId)

    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(GetRunningMeetingsRespMsg.NAME, routing)
    val header = BbbCoreBaseHeader(GetRunningMeetingsRespMsg.NAME)

    val body = GetRunningMeetingsRespMsgBody(meetingIds)
    val event = GetRunningMeetingsRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }

  private def handleGetAllMeetingsReqMsg(msg: GetAllMeetingsReqMsg): Unit = {
    RunningMeetings.meetings(meetings).filter(_.props.systemProps.html5InstanceId == msg.body.html5InstanceId).foreach(m => {
      m.actorRef ! msg
    })
  }

  private def handleCheckAlivePingSysMsg(msg: CheckAlivePingSysMsg): Unit = {
    val event = MsgBuilder.buildCheckAlivePingSysMsg(msg.body.system, msg.body.bbbWebTimestamp, System.currentTimeMillis())
    healthzService.sendPubSubStatusMessage(msg.body.akkaAppsTimestamp, System.currentTimeMillis())
    outGW.send(event)
  }

  private def handleDestroyMeeting(msg: DestroyMeetingInternalMsg): Unit = {

    for {
      m <- RunningMeetings.findWithId(meetings, msg.meetingId)
      m2 <- RunningMeetings.remove(meetings, msg.meetingId)
    } yield {
      // Unsubscribe to meeting and voice events.
      eventBus.unsubscribe(m.actorRef, m.props.meetingProp.intId)
      eventBus.unsubscribe(m.actorRef, m.props.voiceProp.voiceConf)

      bbbMsgBus.unsubscribe(m.actorRef, m.props.meetingProp.intId)
      bbbMsgBus.unsubscribe(m.actorRef, m.props.voiceProp.voiceConf)

      // Delay sending DisconnectAllUsers to allow messages to reach the client
      // before the connections are closed.
      context.system.scheduler.scheduleOnce(Duration.create(2500, TimeUnit.MILLISECONDS)) {
        // Disconnect all clients

        val disconnectEvnt = MsgBuilder.buildDisconnectAllClientsSysMsg(msg.meetingId, "meeting-destroyed")
        m2.outMsgRouter.send(disconnectEvnt)

        log.info("Destroyed meetingId={}", msg.meetingId)
        val destroyedEvent = MsgBuilder.buildMeetingDestroyedEvtMsg(msg.meetingId)
        m2.outMsgRouter.send(destroyedEvent)

        // Stop the meeting actor.
        context.stop(m.actorRef)
      }

      //Remove ColorPicker idx of the meeting
      ColorPicker.reset(m.props.meetingProp.intId)
    }
  }

}
