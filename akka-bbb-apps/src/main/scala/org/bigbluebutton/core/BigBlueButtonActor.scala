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

object BigBlueButtonActor extends SystemConfiguration {
  def props(system: ActorSystem,
    eventBus: IncomingEventBus,
    bbbMsgBus: BbbMsgRouterEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[BigBlueButtonActor], system, eventBus, bbbMsgBus, outGW)
}

class BigBlueButtonActor(val system: ActorSystem,
  val eventBus: IncomingEventBus, val bbbMsgBus: BbbMsgRouterEventBus,
  val outGW: OutMessageGateway) extends Actor
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
    // 2x messages
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)

    // 1x messages
    case msg: DestroyMeeting => handleDestroyMeeting(msg)
    case msg: KeepAliveMessage => handleKeepAliveMessage(msg)
    case msg: PubSubPing => handlePubSubPingMessage(msg)
    case msg: ValidateAuthToken => handleValidateAuthToken(msg)
    case msg: GetAllMeetingsRequest => handleGetAllMeetingsRequest(msg)
    case msg: UserJoinedVoiceConfMessage => handleUserJoinedVoiceConfMessage(msg)
    case msg: UserLeftVoiceConfMessage => handleUserLeftVoiceConfMessage(msg)
    case msg: UserLockedInVoiceConfMessage => handleUserLockedInVoiceConfMessage(msg)
    case msg: UserMutedInVoiceConfMessage => handleUserMutedInVoiceConfMessage(msg)
    case msg: UserTalkingInVoiceConfMessage => handleUserTalkingInVoiceConfMessage(msg)
    case msg: VoiceConfRecordingStartedMessage => handleVoiceConfRecordingStartedMessage(msg)
    case _ => // do nothing
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: CreateMeetingReqMsg => handleCreateMeetingReqMsg(m)
      case m: RegisterUserReqMsg => handleRegisterUserReqMsg(m)
      case m: GetAllMeetingsReqMsg => handleGetAllMeetingsReqMsg(m)
      case _ => log.warning("Cannot handle " + msg.envelope.name)
    }
  }

  def handleRegisterUserReqMsg(msg: RegisterUserReqMsg): Unit = {
    log.debug("RECEIVED RegisterUserReqMsg msg {}", msg)
    for {
      m <- RunningMeetings.findWithId(meetings, msg.header.meetingId)
    } yield {
      m.actorRef forward (msg)
    }
  }

  def handleCreateMeetingReqMsg(msg: CreateMeetingReqMsg): Unit = {
    log.debug("****** RECEIVED CreateMeetingReqMsg msg {}", msg)

    RunningMeetings.findWithId(meetings, msg.body.props.meetingProp.intId) match {
      case None => {
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

        // Send old message format
        outGW.send(new MeetingCreated(m.props.meetingProp.intId,
          m.props.meetingProp.extId, m.props.breakoutProps.parentId,
          m.props.recordProp.record, m.props.meetingProp.name,
          m.props.voiceProp.voiceConf, m.props.durationProps.duration,
          m.props.password.moderatorPass, m.props.password.viewerPass,
          m.props.durationProps.createdTime, m.props.durationProps.createdDate,
          m.props.meetingProp.isBreakout))

        m.actorRef ! new InitializeMeeting(m.props.meetingProp.intId, m.props.recordProp.record)

        // Send new 2x message
        val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
        val envelope = BbbCoreEnvelope(MeetingCreatedEvtMsg.NAME, routing)
        val header = BbbCoreBaseHeader(MeetingCreatedEvtMsg.NAME)
        val body = MeetingCreatedEvtBody(msg.body.props)
        val event = MeetingCreatedEvtMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)
      }
      case Some(m) => {
        log.info("Meeting already created. meetingID={}", msg.body.props.meetingProp.intId)
        // do nothing
      }
    }

  }

  private def handleGetAllMeetingsReqMsg(msg: GetAllMeetingsReqMsg): Unit = {
    RunningMeetings.meetings(meetings).foreach(m => {
      m.actorRef ! msg
    })
  }

  private def findMeetingWithVoiceConfId(voiceConfId: String): Option[RunningMeeting] = {
    RunningMeetings.findMeetingWithVoiceConfId(meetings, voiceConfId)
  }

  private def handleUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m => m.actorRef ! msg }
  }

  private def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
    }
  }

  private def handleUserLockedInVoiceConfMessage(msg: UserLockedInVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
    }
  }

  private def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
    }
  }

  private def handleVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
    }

  }

  private def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    findMeetingWithVoiceConfId(msg.voiceConfId) foreach { m =>
      m.actorRef ! msg
    }
  }

  private def handleValidateAuthToken(msg: ValidateAuthToken) {
    for {
      m <- RunningMeetings.findWithId(meetings, msg.meetingID)
    } yield {
      m.actorRef forward (msg)
    }

    //meetings.get(msg.meetingID) foreach { m =>
    //  m.actorRef ! msg

    //      val future = m.actorRef.ask(msg)(5 seconds)
    //      future onComplete {
    //        case Success(result) => {
    //          log.info("Validate auth token response. meetingId=" + msg.meetingID + " userId=" + msg.userId + " token=" + msg.token)
    //          /**
    //           * Received a reply from MeetingActor which means hasn't hung!
    //           * Sometimes, the actor seems to hang and doesn't anymore accept messages. This is a simple
    //           * audit to check whether the actor is still alive. (ralam feb 25, 2015)
    //           */
    //        }
    //        case Failure(failure) => {
    //          log.warning("Validate auth token timeout. meetingId=" + msg.meetingID + " userId=" + msg.userId + " token=" + msg.token)
    //          outGW.send(new ValidateAuthTokenTimedOut(msg.meetingID, msg.userId, msg.token, false, msg.correlationId))
    //        }
    //      }
    //}
  }

  private def handleKeepAliveMessage(msg: KeepAliveMessage): Unit = {
    outGW.send(new KeepAliveMessageReply(msg.aliveID))
  }

  private def handlePubSubPingMessage(msg: PubSubPing): Unit = {
    outGW.send(new PubSubPong(msg.system, msg.timestamp))
  }

  private def handleDestroyMeeting(msg: DestroyMeeting) {
    log.info("Received DestroyMeeting message for meetingId={}", msg.meetingID)

    for {
      m <- RunningMeetings.findWithId(meetings, msg.meetingID)
      m2 <- RunningMeetings.remove(meetings, msg.meetingID)
    } yield {
      log.info("Kick everyone out on meetingId={}", msg.meetingID)
      if (m.props.meetingProp.isBreakout) {
        log.info("Informing parent meeting {} that a breakout room has been ended {}",
          m.props.breakoutProps.parentId, m.props.meetingProp.intId)
        eventBus.publish(BigBlueButtonEvent(m.props.breakoutProps.parentId,
          BreakoutRoomEnded(m.props.breakoutProps.parentId, m.props.meetingProp.intId)))
      }

      // Eject all users using the client.
      outGW.send(new EndAndKickAll(msg.meetingID, m.props.recordProp.record))
      // Eject all users from the voice conference
      outGW.send(new EjectAllVoiceUsers(msg.meetingID, m.props.recordProp.record, m.props.voiceProp.voiceConf))

      // Delay sending DisconnectAllUsers because of RTMPT connection being dropped before UserEject message arrives to the client
      context.system.scheduler.scheduleOnce(Duration.create(2500, TimeUnit.MILLISECONDS)) {
        // Disconnect all clients
        outGW.send(new DisconnectAllUsers(msg.meetingID))
        log.info("Destroyed meetingId={}", msg.meetingID)
        outGW.send(new MeetingDestroyed(msg.meetingID))

        /** Unsubscribe to meeting and voice events. **/
        eventBus.unsubscribe(m.actorRef, m.props.meetingProp.intId)
        eventBus.unsubscribe(m.actorRef, m.props.voiceProp.voiceConf)

        // Stop the meeting actor.
        context.stop(m.actorRef)
      }
    }

    /*
    meetings.get(msg.meetingID) match {
      case None => log.info("Could not find meetingId={}", msg.meetingID)
      case Some(m) => {
        meetings -= msg.meetingID
        log.info("Kick everyone out on meetingId={}", msg.meetingID)
        if (m.mProps.isBreakout) {
          log.info("Informing parent meeting {} that a breakout room has been ended {}", m.mProps.parentMeetingID, m.mProps.meetingID)
          eventBus.publish(BigBlueButtonEvent(m.mProps.parentMeetingID,
            BreakoutRoomEnded(m.mProps.parentMeetingID, m.mProps.meetingID)))
        }

        // Eject all users using the client.
        outGW.send(new EndAndKickAll(msg.meetingID, m.mProps.recorded))
        // Eject all users from the voice conference
        outGW.send(new EjectAllVoiceUsers(msg.meetingID, m.mProps.recorded, m.mProps.voiceBridge))

        // Delay sending DisconnectAllUsers because of RTMPT connection being dropped before UserEject message arrives to the client  
        context.system.scheduler.scheduleOnce(Duration.create(2500, TimeUnit.MILLISECONDS)) {
          // Disconnect all clients
          outGW.send(new DisconnectAllUsers(msg.meetingID))
          log.info("Destroyed meetingId={}", msg.meetingID)
          outGW.send(new MeetingDestroyed(msg.meetingID))

          // Unsubscribe to meeting and voice events.
          eventBus.unsubscribe(m.actorRef, m.mProps.meetingID)
          eventBus.unsubscribe(m.actorRef, m.mProps.voiceBridge)

          // Stop the meeting actor.
          context.stop(m.actorRef)
        }
      }
    }
 */
  }

  private def handleGetAllMeetingsRequest(msg: GetAllMeetingsRequest) {
    val len = RunningMeetings.numMeetings(meetings)
    var currPosition = len - 1
    val resultArray: Array[MeetingInfo] = new Array[MeetingInfo](len)

    RunningMeetings.meetings(meetings).foreach(m => {
      val id = m.props.meetingProp.intId
      val duration = m.props.durationProps.duration
      val name = m.props.meetingProp.name
      val recorded = m.props.recordProp.record
      val voiceBridge = m.props.voiceProp.voiceConf

      val info = new MeetingInfo(id, name, recorded, voiceBridge, duration)
      resultArray(currPosition) = info
      currPosition = currPosition - 1

      val html5clientRequesterID = "nodeJSapp"

      //send the users
      eventBus.publish(BigBlueButtonEvent(id, new GetUsers(id, html5clientRequesterID)))

      //send the presentation
      eventBus.publish(BigBlueButtonEvent(id, new GetPresentationInfo(id, html5clientRequesterID, html5clientRequesterID)))

      //send chat history
      //eventBus.publish(BigBlueButtonEvent(id, new GetAllChatHistoryRequest(id, html5clientRequesterID, html5clientRequesterID)))

      //send lock settings
      eventBus.publish(BigBlueButtonEvent(id, new GetLockSettings(id, html5clientRequesterID)))

      //send desktop sharing info
      eventBus.publish(BigBlueButtonEvent(id, new DeskShareGetDeskShareInfoRequest(id, html5clientRequesterID, html5clientRequesterID)))

      // send captions
      //eventBus.publish(BigBlueButtonEvent(id, new SendCaptionHistoryRequest(id, html5clientRequesterID)))
    })

    outGW.send(new GetAllMeetingsReply(resultArray))
  }

}
