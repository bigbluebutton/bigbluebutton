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
import org.bigbluebutton.core.models.Roles
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

  private case class SessionTokenInfo(
      meetingId: String,
      userId:    String,
      replaced:  Boolean = false
  )
  private var sessionTokens = new collection.immutable.HashMap[String, SessionTokenInfo] //sessionToken -> SessionTokenInfo

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on BigBlueButtonActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  object BBBTasksExecutor
  context.system.scheduler.schedule(
    1 minute,
    1 minute,
    self,
    BBBTasksExecutor
  )

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
    case BBBTasksExecutor               => handleMeetingTasksExecutor()
    case msg: DestroyMeetingInternalMsg => handleDestroyMeeting(msg)

    //Api messages
    case msg: GetUserApiMsg             => handleGetUserApiMsg(msg, sender)

    // 2x messages
    case msg: BbbCommonEnvCoreMsg       => handleBbbCommonEnvCoreMsg(msg)
    case _                              => // do nothing
  }

  private def handleGetUserApiMsg(msg: GetUserApiMsg, actorRef: ActorRef): Unit = {
    log.debug("RECEIVED GetUserApiMsg msg {}", msg)

    sessionTokens.get(msg.sessionToken) match {
      case Some(sessionTokenInfo) =>
        if (sessionTokenInfo.replaced) {
          log.debug("handleGetUserApiMsg ({}): Session token replaced.", msg.sessionToken)
          actorRef ! ApiResponseFailure("Session token replaced.", "session_token_replaced")
        } else {
          RunningMeetings.findWithId(meetings, sessionTokenInfo.meetingId) match {
            case Some(m) =>
              log.debug("handleGetUserApiMsg ({}): Meeting: {}.", msg.sessionToken, m.props.meetingProp.intId)
              m.actorRef forward (msg)

            case None =>
              //The meeting is ended, it will return some data just to confirm the session was valid
              //The client can request data after the meeting is ended
              val userInfos = Map(
                "returncode" -> "SUCCESS",
                "sessionToken" -> msg.sessionToken,
                "meetingID" -> sessionTokenInfo.meetingId,
                "internalUserID" -> sessionTokenInfo.userId,
                "externMeetingID" -> "",
                "externUserID" -> "",
                "currentlyInMeeting" -> false,
                "authToken" -> "",
                "role" -> Roles.VIEWER_ROLE,
                "guest" -> "false",
                "guestStatus" -> "ALLOWED",
                "moderator" -> false,
                "presenter" -> false,
                "hideViewersCursor" -> false,
                "hideViewersAnnotation" -> false,
                "hideUserList" -> false,
                "webcamsOnlyForModerator" -> false
              )

              log.debug("handleGetUserApiMsg ({}): Meeting is ended.", msg.sessionToken)
              actorRef ! ApiResponseSuccess("Meeting is ended.", UserInfosApiMsg(userInfos))
          }
        }

      case None =>
        log.debug("handleGetUserApiMsg ({}): Meeting not found.", msg.sessionToken)
        actorRef ! ApiResponseFailure("Meeting not found.", "meeting_not_found")
    }
  }

  private def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {

      case m: CreateMeetingReqMsg                    => handleCreateMeetingReqMsg(m)
      case m: RegisterUserReqMsg                     => handleRegisterUserReqMsg(m)
      case m: RegisterUserSessionTokenReqMsg         => handleRegisterUserSessionTokenReqMsg(m)
      case m: CheckAlivePingSysMsg                   => handleCheckAlivePingSysMsg(m)
      case _: UserGraphqlConnectionEstablishedSysMsg => //Ignore
      case _: UserGraphqlConnectionClosedSysMsg      => //Ignore
      case _: CheckGraphqlMiddlewareAlivePongSysMsg  => //Ignore
      case _                                         => log.warning("Cannot handle " + msg.envelope.name)
    }
  }

  def handleRegisterUserReqMsg(msg: RegisterUserReqMsg): Unit = {
    log.debug("RECEIVED RegisterUserReqMsg msg {}", msg)
    for {
      m <- RunningMeetings.findWithId(meetings, msg.header.meetingId)
    } yield {
      log.debug("FORWARDING Register user message")

      //Store sessionTokens and associate them with their respective meetingId + userId owners
      sessionTokens += (msg.body.sessionToken -> SessionTokenInfo(msg.body.meetingId, msg.body.intUserId))

      m.actorRef forward (msg)
    }
  }

  def handleRegisterUserSessionTokenReqMsg(msg: RegisterUserSessionTokenReqMsg): Unit = {
    log.debug("RECEIVED RegisterUserSessionTokenReqMsg msg {}", msg)
    for {
      m <- RunningMeetings.findWithId(meetings, msg.header.meetingId)
    } yield {
      log.debug("FORWARDING Register user session token message")

      //Store sessionTokens and associate them with their respective meetingId + userId owners
      sessionTokens += (msg.body.sessionToken -> SessionTokenInfo(msg.body.meetingId, msg.body.userId))

      if (msg.body.replaceSessionToken.nonEmpty) {
        for {
          sessionTokenInfo <- sessionTokens.get(msg.body.replaceSessionToken)
        } yield {
          sessionTokens += (msg.body.replaceSessionToken -> sessionTokenInfo.copy(replaced = true))
        }
      }

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

  private def handleCheckAlivePingSysMsg(msg: CheckAlivePingSysMsg): Unit = {
    val event = MsgBuilder.buildCheckAlivePingSysMsg(msg.body.system, msg.body.bbbWebTimestamp, System.currentTimeMillis())
    healthzService.sendPubSubStatusMessage(msg.body.akkaAppsTimestamp, System.currentTimeMillis())
    outGW.send(event)
  }

  private def handleMeetingTasksExecutor(): Unit = {
    // Delays meeting data for 1 hour post-meeting in case users request info after it ends.
    // This routine ensures proper purging if akka-apps restart and the handleDestroyMeeting scheduler does not run.
    MeetingDAO.deleteOldMeetings()
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

      //Delay removal of session tokens and Graphql data once users might request some info after the meeting is ended
      context.system.scheduler.scheduleOnce(Duration.create(60, TimeUnit.MINUTES)) {
        log.debug("Removing Graphql data and session tokens. meetingID={}", msg.meetingId)

        sessionTokens = sessionTokens.filter(sessionTokenInfo => sessionTokenInfo._2.meetingId != msg.meetingId)

        //In Db, Removing the meeting is enough, all other tables has "ON DELETE CASCADE"
        MeetingDAO.delete(msg.meetingId)
      }

      //Remove ColorPicker idx of the meeting
      ColorPicker.reset(m.props.meetingProp.intId)
    }
  }

}
