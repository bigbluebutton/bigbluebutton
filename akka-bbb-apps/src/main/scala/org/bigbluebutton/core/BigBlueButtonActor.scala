package org.bigbluebutton.core

import java.io.{ PrintWriter, StringWriter }
import org.apache.pekko.actor._
import org.apache.pekko.actor.ActorLogging
import org.apache.pekko.actor.SupervisorStrategy.Resume
import org.apache.pekko.util.Timeout

import scala.concurrent.duration._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api._
import org.bigbluebutton.SystemConfiguration

import java.util.concurrent.TimeUnit
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.db.{ DatabaseConnection, MeetingDAO }
import org.bigbluebutton.core.domain.MeetingEndReason
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
    DatabaseConnection.initialize()

    //Terminate all previous meetings, as they will not function following the akka-apps restart
    MeetingDAO.setAllMeetingsEnded(MeetingEndReason.ENDED_DUE_TO_SERVICE_INTERRUPTION, "system")
  }

  override def postStop() {
    bbbMsgBus.unsubscribe(self, meetingManagerChannel)
  }

  def receive = {
    // Internal messages
    case msg: DestroyMeetingInternalMsg => handleDestroyMeeting(msg)
    case msg: IsMeetingRunning          => handleIsMeetingRunning(sender(), msg)
    case msg: GetMeeting                => handleGetMeeting(sender(), msg)
    case msg: GetMeetings               => handleGetMeetings(sender(), msg)
    case msg: GetNextVoiceBridge        => handleGetNextVoiceBridge(sender(), msg)
    case msg: CreateMeeting             => handleCreateMeeting(sender(), msg)
    case msg: IsVoiceBridgeInUse        => handleIsVoiceBridgeInUse(sender(), msg)

    // 2x messages
    case msg: BbbCommonEnvCoreMsg       => handleBbbCommonEnvCoreMsg(msg)
    case _                              => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {

      case m: CreateMeetingReqMsg                    => handleCreateMeetingReqMsg(m)
      case m: RegisterUserReqMsg                     => handleRegisterUserReqMsg(m)
      case m: GetAllMeetingsReqMsg                   => handleGetAllMeetingsReqMsg(m)
      case m: GetRunningMeetingsReqMsg               => handleGetRunningMeetingsReqMsg(m)
      case m: CheckAlivePingSysMsg                   => handleCheckAlivePingSysMsg(m)
      case m: ValidateConnAuthTokenSysMsg            => handleValidateConnAuthTokenSysMsg(m)
      case _: UserGraphqlConnectionEstablishedSysMsg => //Ignore
      case _: UserGraphqlConnectionClosedSysMsg      => //Ignore
      case _: CheckGraphqlMiddlewareAlivePongSysMsg  => //Ignore
      case _                                         => log.warning("Cannot handle " + msg.envelope.name)
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
    RunningMeetings.meetings(meetings).foreach(m => {
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

      //      MeetingDAO.delete(msg.meetingId)
      //      MeetingDAO.setMeetingEnded(msg.meetingId)
      //      Removing the meeting is enough, all other tables has "ON DELETE CASCADE"
      //      UserDAO.softDeleteAllFromMeeting(msg.meetingId)
      //      MeetingRecordingDAO.updateStopped(msg.meetingId, "")

      //Remove ColorPicker idx of the meeting
      ColorPicker.reset(m.props.meetingProp.intId)
    }
  }

  private def handleIsMeetingRunning(sender: ActorRef, msg: IsMeetingRunning): Unit = {
    RunningMeetings.findWithId(meetings, msg.meetingId) match {
      case Some(_) => sender ! true
      case None =>
        RunningMeetings.findWithExtId(meetings, msg.meetingId) match {
          case Some(_) => sender ! true
          case None    => sender ! false
        }
    }
  }

  private def handleGetMeeting(sender: ActorRef, msg: GetMeeting): Unit = {
    RunningMeetings.findWithId(meetings, msg.meetingId) match {
      case Some(m) => sender ! Some(m)
      case None =>
        RunningMeetings.findWithExtId(meetings, msg.meetingId) match {
          case Some(m) => sender ! Some(m)
          case None    => sender ! None
        }
    }
  }

  private def handleGetMeetings(sender: ActorRef, msg: GetMeetings): Unit = {
    sender ! RunningMeetings.meetingsMap(meetings)
  }

  private def handleGetNextVoiceBridge(sender: ActorRef, msg: GetNextVoiceBridge): Unit = {
    sender ! RunningMeetings.getVoiceBridge(meetings, msg.length)
  }

  // Attempt to create a new meeting. Asynchronously returns three pieces of information to the calling actor:
  // - RunningMeeting: the newly created meeting or an already existing meeting if the meetingID is already in use
  // - Duplicate: indicates whether the meeting that was attempted to be created is a duplicate or not
  // - Valid: indicates whether the request is valid (only returns true if a new meeting was created or an attempt was made to re-create the same meeting)
  private def handleCreateMeeting(sender: ActorRef, msg: CreateMeeting): Unit = {
    RunningMeetings.findWithId(meetings, msg.props.meetingProp.intId) match {
      case None =>
        log.info("Creating meeting. meetingId={}", msg.props.meetingProp.intId)

        val m = RunningMeeting(msg.props, outGW, eventBus)

        // Subscribe to meeting and voice events.
        eventBus.subscribe(m.actorRef, m.props.meetingProp.intId)
        eventBus.subscribe(m.actorRef, m.props.voiceProp.voiceConf)

        bbbMsgBus.subscribe(m.actorRef, m.props.meetingProp.intId)
        bbbMsgBus.subscribe(m.actorRef, m.props.voiceProp.voiceConf)

        RunningMeetings.add(meetings, m)

        sender ! (m, false, true)
      case Some(m) =>
        log.info("Meeting already created. meetingID={}", msg.props.meetingProp.intId)

        if ((m.props.password.viewerPass.equals(msg.props.password.viewerPass) && m.props.password.moderatorPass.equals(msg.props.password.moderatorPass)) ||
          (msg.props.password.viewerPass.isEmpty() && msg.props.password.moderatorPass.isEmpty())) {
          sender ! (m, true, true)
        } else {
          sender ! (m, true, false)
        }
    }
  }

  private def handleIsVoiceBridgeInUse(sender: ActorRef, msg: IsVoiceBridgeInUse): Unit = {
    sender ! RunningMeetings.isVoiceBridgeInUse(meetings, msg.voiceBridge)
  }
}
