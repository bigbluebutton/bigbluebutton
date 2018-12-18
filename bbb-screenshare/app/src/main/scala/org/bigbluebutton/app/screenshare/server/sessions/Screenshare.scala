/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2016 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.app.screenshare.server.sessions

import org.bigbluebutton.app.screenshare.StreamInfo
import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import scala.collection.mutable.HashMap
import org.bigbluebutton.app.screenshare.events._
import org.bigbluebutton.app.screenshare.server.sessions.ScreenShareAuditInternal.{ StartSendingAudit, StopSendingAudit }
import org.bigbluebutton.app.screenshare.server.sessions.Screenshare.SessionAuditMessage
import org.bigbluebutton.app.screenshare.server.sessions.messages.{ StartShareRequestMessage, _ }
import org.bigbluebutton.app.screenshare.server.util.TimeUtil
import scala.concurrent.duration._
import scala.collection.immutable.StringOps

object ScreenShareAuditInternal {

  case class StartSendingAudit(session: String)
  case class StopSendingAudit(session: String)

  def props(meetingId: String): Props =
    Props(classOf[ScreenShareAuditInternal], meetingId)
}

class ScreenShareAuditInternal(meetingId: String) extends Actor with ActorLogging {

  import context.dispatcher
  context.system.scheduler.schedule(2 seconds, 5 seconds, self, "SendInternalScreenShareSessionAudit")

  private var session: Option[String] = None
  private var sendAudit = false

  def receive = {
    case "SendInternalScreenShareSessionAudit" => handleSendInternalScreenShareSessionAudit()
    case msg: StartSendingAudit =>
      sendAudit = true
      session = Some(msg.session)
    case msg: StopSendingAudit =>
      sendAudit = false
      session = None
  }

  private def handleSendInternalScreenShareSessionAudit(): Unit = {
    if (sendAudit) {
      session foreach { s =>
        context.parent ! SessionAuditMessage(s)
      }

    }
  }

}

object Screenshare {
  def props(screenshareSessionManager: ScreenshareManager, bus: IEventsMessageBus, meetingId: String, record: Boolean): Props =
    Props(classOf[Screenshare], screenshareSessionManager, bus, meetingId, record)

  case class SessionAuditMessage(session: String)
  case class KeepAliveTimeout(streamId: String, stopSharing: Boolean)
}

class Screenshare(
  val sessionManager: ScreenshareManager,
  val bus: IEventsMessageBus,
  val meetingId: String, val record: Boolean) extends Actor with ActorLogging {

  log.info("Creating a new Screenshare for meetingId={}", meetingId)

  //private val sessions = new HashMap[String, ActiveSession]

  private val START = "START"
  private val PAUSE = "PAUSE"
  private val RUNNING = "RUNNING"
  private val STOP = "STOP"
  private val SHUTDOWN = "SHUTDOWN"

  // start, running, pause, stop
  private var status: String = START

  // index to increment streamId so we can support
  // start-pause-stop
  private var streamIdCount = 0

  // A screen sharing session that has lifecyle of start, pause, resume, and stop.
  private var screenShareSession: Option[String] = None

  // A broadcast stream session withing the screen share session.
  private var activeSession: Option[ActiveSession] = None

  private var currentPresenterId: Option[String] = None

  private var width: Option[Int] = None
  private var height: Option[Int] = None

  private var streamUrl: Option[String] = None

  // Number of seconds before we assume that the JWS is dead.
  private val LAST_JWS_STATUS_UPDATE_TIMEOUT = 10
  private var lastJwsStatusUpdate = 0L

  private var sessionStartedTimestamp: Long = 0L
  private val JWS_START_TIMEOUT = 90

  // The number of seconds we wait for the JWS to launch when
  // resuming sharing. Sometimes, on PAUSE, the JWS crashes but
  // the server doesn't detect it before the presenter resumes sharing.
  private val JWS_RESTART_TIMEOUT = 10

  private var jwsLaunchTimeout = JWS_START_TIMEOUT

  // The last time we received a pong response from the client.
  // We need to check if the client is still alive. If the client
  // crashed, we need to end the screen sharing as soon as we detect it.
  private var lastClientPongReceivedTimestamp = 0L
  private val PONG_TIMEOUT_SEC = 20

  private val MEETING_ENDED_REASON = "MEETING_ENDED_REASON"
  private val JWS_GONE_REASON = "JWS_GONE_REASON"
  private val CLIENT_GONE_REASON = "CLIENT_GONE_REASON"
  private val NORMAL_REASON = "NORMAL_REASON"
  private val PRESENTER_DISCONNECTED_REASON = "PRESENTER_DISCONNECTED_REASON"
  private val PRESENTER_AUTO_RECONNECTED_REASON = "PRESENTER_AUTO_RECONNECTED_REASON"
  private val JWS_START_FAILED_REASON = "JWS_START_FAILED_REASON"

  // RTMP or RTMPT
  private var tunnel: Boolean = false;

  val sessionAudit = context.actorOf(ScreenShareAuditInternal.props(meetingId))

  def receive = {
    case msg: RestartShareRequestMessage => handleRestartShareRequestMessage(msg)
    case msg: PauseShareRequestMessage => handlePauseShareRequestMessage(msg)
    case msg: RequestShareTokenMessage => handleRequestShareTokenMessage(msg)
    case msg: StartShareRequestMessage => handleStartShareRequestMessage(msg)
    case msg: StopShareRequestMessage => handleStopShareRequestMessage(msg)
    case msg: StreamStartedMessage => handleStreamStartedMessage(msg)
    case msg: StreamStoppedMessage => handleStreamStoppedMessage(msg)
    case msg: SharingStartedMessage => handleSharingStartedMessage(msg)
    case msg: SharingStoppedMessage => handleSharingStoppedMessage(msg)
    case msg: GetSharingStatus => handleGetSharingStatus(msg)
    case msg: IsScreenSharing => handleIsScreenSharing(msg)
    case msg: IsStreamRecorded => handleIsStreamRecorded(msg)
    case msg: UpdateShareStatus => handleUpdateShareStatus(msg)
    case msg: UserDisconnected => handleUserDisconnected(msg)
    case msg: UserConnected => handleUserConnected(msg)
    case msg: ScreenShareInfoRequest => handleScreenShareInfoRequest(msg)
    case msg: MeetingEnded => handleMeetingHasEnded(msg)
    case msg: SessionAuditMessage => handleSessionAuditMessage(msg)
    case msg: ClientPongMessage => handleClientPongMessage(msg)
    case msg: AuthorizeBroadcastStreamMessage => handleAuthorizeBroadcastStreamMessage(msg)

    case m: Any => log.warning("Session: Unknown message [{}]", m)
  }

  private def handleClientPongMessage(msg: ClientPongMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received ClientPongMessage message for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach { as =>
      if (as.streamId == msg.streamId) {
        lastClientPongReceivedTimestamp = TimeUtil.currentMonoTimeInSeconds()
      }
    }
  }

  private def handleMeetingHasEnded(msg: MeetingEnded) {
    if (log.isDebugEnabled) {
      log.debug("Received MeetingHasEnded for meetingId=[" + msg.meetingId + "]")
    }

    for {
      as <- activeSession
      sss <- screenShareSession
    } yield (bus.send(new ScreenShareStoppedEvent(meetingId, sss, MEETING_ENDED_REASON)))

    context.stop(sessionAudit)
    context.stop(self)
  }

  private def trimUserId2(userId: String): Option[String] = {
    // A userId has the format "abc123_1" where "_1" refers to the number
    // of times the user rejoins due to disconnect. We strip off that number
    // to get the real userId so we can map the screen sharing session to the
    // user.
    val userIdStringOps = new StringOps(userId)
    val userIdArray = userIdStringOps.split('_')

    if (userIdArray.length == 2) {
      Some(userIdArray(0))
    } else {
      None
    }
  }

  private def handleUserDisconnected(msg: UserDisconnected) {
    if (log.isDebugEnabled) {
      log.debug("Received UserDisconnected for meetingId=[" + msg.meetingId +
        "] userId=[" + msg.userId + "], sss=" + screenShareSession + ",curPres=" + currentPresenterId)
    }

    for {
      sss <- screenShareSession
      curPresenterId = currentPresenterId.get
    } yield {
      if (log.isDebugEnabled) {
        log.debug("Received UserDisconnected for curPresenterId=[" + curPresenterId + "] userId=[" + msg.userId + "]")
      }
      if (msg.userId == curPresenterId) {
        log.info("STOPPING UserDisconnected for curPresenterId=[" + curPresenterId + "] session=[" + sss + "]")
        stopScreenSharing(sss, PRESENTER_DISCONNECTED_REASON)
      }
    }
  }

  private def handleUserConnected(msg: UserConnected) {
    if (log.isDebugEnabled) {
      log.debug("Received UserConnected for meetingId=[" + msg.meetingId + "]")
    }

    for {
      sss <- screenShareSession
      curPresenterId = currentPresenterId.get
    } yield {
      if (msg.userId == curPresenterId) {
        log.info("STOPPING. User auto-reconnected for curPresenterId=[" + curPresenterId + "], session=[" + sss + "]")
        stopScreenSharing(sss, PRESENTER_AUTO_RECONNECTED_REASON)
      }
    }
  }

  private def handleIsScreenSharing(msg: IsScreenSharing) {
    if (log.isDebugEnabled) {
      log.debug("Received IsScreenSharing for meetingId=[" + msg.meetingId + "] from userId=" + msg.userId)
    }

    activeSession match {
      case Some(as) =>
        for {
          w <- width
          h <- height
          url <- streamUrl
          sss <- screenShareSession
        } yield {
          val info = new StreamInfo(true, as.streamId, w, h, url, sss)
          bus.send(new IsScreenSharingResponse(meetingId, msg.userId, info))
        }
      case None =>
        val info = new StreamInfo(false, "", 0, 0, "", "")
        bus.send(new IsScreenSharingResponse(meetingId, msg.userId, info))
    }
  }

  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (log.isDebugEnabled) {
      log.debug("Received ScreenShareInfoRequest for token=[" + msg.token + "]")
    }

    for {
      as <- activeSession
      sss <- screenShareSession
    } yield {
      if (as.token == msg.token) {
        sender ! new ScreenShareInfoRequestReply(msg.meetingId, as.streamId, sss, as.tunnel)
      }
    }
  }

  private def handleIsStreamRecorded(msg: IsStreamRecorded) {
    if (log.isDebugEnabled) {
      log.debug("Received IsStreamRecorded for streamId=[" + msg.streamId + "]")
    }

    sender ! new IsStreamRecordedReply(record)
  }

  private def handleUpdateShareStatus(msg: UpdateShareStatus) {
    if (log.isDebugEnabled) {
      log.debug("Received JWS UpdateShareStatus for streamId=[" + msg.streamId + "]")
    }

    screenShareSession foreach { sss =>
      if (msg.streamId.startsWith(sss)) {
        if (log.isDebugEnabled) {
          log.debug("UpdateShareStatus for streamId=[" + msg.streamId + "].")
        }
        lastJwsStatusUpdate = TimeUtil.currentMonoTimeInSeconds()
      }
    }
  }

  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received JWS SharingStoppedMessage for streamId=[" + msg.streamId + "]")
    }

    status = STOP

    for {
      sss <- screenShareSession
    } yield (stopScreenSharing(sss, NORMAL_REASON))

  }

  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received JWS SharingStartedMessage for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach { as =>
      status = RUNNING

      width = Some(msg.width)
      height = Some(msg.height)

      // We wait until we have the width, height, and stream url before notifying
      // clients that stream has started. This way we prevent a race condition
      // where we have the stream url but the width and height is zero. (ralam aug 16, 2016)
      for {
        w <- width
        h <- height
        url <- streamUrl
        sss <- screenShareSession
      } yield (bus.send(new ScreenShareStartedEvent(meetingId, as.streamId, w, h, url, sss)))
    }

  }

  private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StreamStoppedMessage for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach { as =>
      if (as.streamId == msg.streamId) {
        if (status == PAUSE) {
          log.info("Sending screen share paused event for streamId=" + as.streamId)
          bus.send(new ScreenSharePausedEvent(meetingId, as.streamId))
          resetScreenShareSession()
        }
      }
    }
  }

  private def handleStreamStartedMessage(msg: StreamStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StreamStartedMessage for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach { as =>
      streamUrl = Some(msg.url)

      // We wait until we have the width, height, and stream url before notifying
      // clients that stream has started. This way we prevent a race condition
      // where we have the stream url but the width and height is zero. (ralam aug 16, 2016)
      for {
        w <- width
        h <- height
        url <- streamUrl
        sss <- screenShareSession
      } yield (bus.send(new ScreenShareStartedEvent(meetingId, as.streamId, w, h, url, sss)))
    }
  }

  private def handleAuthorizeBroadcastStreamMessage(msg: AuthorizeBroadcastStreamMessage): Unit = {
    if (log.isDebugEnabled) {
      log.debug("handleAuthorizeBroadcastStreamMessage meetingId=" + msg.meetingId +
        " streamId=" + msg.streamId + " connId=" + msg.connId + " scope=" + msg.scope)
    }

    activeSession match {
      case Some(as) =>
        if (as.streamId != msg.streamId) {
          bus.send(new UnauthorizedBroadcastStreamEvent(msg.meetingId, msg.streamId, msg.connId, msg.scope))
        }
      case None => bus.send(new UnauthorizedBroadcastStreamEvent(msg.meetingId, msg.streamId, msg.connId, msg.scope))
    }
  }

  private def resetScreenShareSession() = {
    width = None
    height = None
    streamUrl = None
    activeSession = None

  }

  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StopShareRequestMessage for streamId=[" + msg.streamId + "]")
    }

    status = STOP

    screenShareSession foreach { sss =>
      stopScreenSharing(sss, NORMAL_REASON)
    }

  }

  private def handlePauseShareRequestMessage(msg: PauseShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received PauseShareRequestMessage for streamId=[" + msg.streamId + "]")
    }

    for {
      as <- activeSession
      sss <- screenShareSession
    } yield {
      if (as.streamId == msg.streamId) {
        status = PAUSE
        if (!isStreaming(streamUrl)) {
          log.info("Sending screen share paused event for session=" + sss)
          bus.send(new ScreenSharePausedEvent(meetingId, sss))
          resetScreenShareSession()
        }
      }
    }
  }

  private def handleRestartShareRequestMessage(msg: RestartShareRequestMessage) {

    def generateStreamId(sessionToken: String): String = {
      val streamId = sessionToken + "-" + streamIdCount
      streamIdCount = streamIdCount + 1
      streamId
    }

    if (log.isDebugEnabled) {
      log.debug("Received RestartShareRequestMessage from userId=[" + msg.userId + "]")
    }

    screenShareSession match {
      case Some(sessionToken) =>
        val streamId = generateStreamId(sessionToken)
        val token = streamId

        val userId = msg.userId
        val session = ActiveSession(this, bus, meetingId, streamId, token, record, userId, tunnel)
        activeSession = Some(session)
        sessionStartedTimestamp = TimeUtil.currentMonoTimeInSeconds()
        status = START
        jwsLaunchTimeout = JWS_RESTART_TIMEOUT
      case None =>
        log.warning("Restarting sharing but no previous session for meetingId=" + meetingId)
    }
  }

  private def handleRequestShareTokenMessage(msg: RequestShareTokenMessage): Unit = {
    def genSessionToken(): String = {
      meetingId + "-" + System.currentTimeMillis()
    }
    def generateStreamId(sessionToken: String): String = {
      val streamId = sessionToken + "-" + streamIdCount
      streamIdCount = streamIdCount + 1
      streamId
    }

    val sessionToken = genSessionToken()
    screenShareSession = Some(sessionToken)

    val streamId = generateStreamId(sessionToken)
    val token = streamId

    val userId = msg.userId

    tunnel = msg.tunnel
    val session = ActiveSession(this, bus, meetingId, streamId, token, msg.record, userId, tunnel)
    activeSession = Some(session)

    currentPresenterId = Some(msg.userId)

    screenShareSession foreach { sss =>
      bus.send(new ScreenShareRequestTokenSuccessResponse(meetingId, msg.userId, token, msg.jnlp, streamId, sss))
    }
  }

  private def handleStartShareRequestMessage(msg: StartShareRequestMessage) {

    status = START
    sessionStartedTimestamp = TimeUtil.currentMonoTimeInSeconds()
    lastClientPongReceivedTimestamp = 0L
    lastJwsStatusUpdate = 0L
    jwsLaunchTimeout = JWS_START_TIMEOUT

    screenShareSession foreach { sss =>

      sessionAudit ! StartSendingAudit(sss)
    }

  }

  private def handleGetSharingStatus(msg: GetSharingStatus) {
    if (log.isDebugEnabled) {
      log.debug("Received GetSharingStatus for streamId=[" + msg.streamId + "]")
    }

    def processStaleSession(): Unit = {
      log.warning("Stopping JWS. GetSharingStatus for streamId=[" + msg.streamId + "] session stale.")
      sender ! new GetSharingStatusReply(STOP, None)
    }

    def processPausedStatus(): Unit = {
      if (log.isDebugEnabled) {
        log.debug("Replying PAUSED JWS. GetSharingStatus for streamId=[" + msg.streamId + "].")
      }
      sender ! new GetSharingStatusReply(PAUSE, None)
    }

    def processStartStatus(): Unit = {
      activeSession match {
        case Some(as) =>
          if (log.isDebugEnabled) {
            log.debug("Replying START JWS. GetSharingStatus for streamId=[" + msg.streamId + "].")
          }
          sender ! new GetSharingStatusReply(START, Some(as.streamId))
        case None =>
          log.warning("Forcing stop. No active session for meetingId=" + meetingId + ",streamId=[" + msg.streamId + "].")
          sender ! new GetSharingStatusReply(STOP, None)
      }
    }

    def processRunningStatus(): Unit = {
      if (log.isDebugEnabled) {
        log.debug("Replying RUNNING JWS. GetSharingStatus for streamId=[" + msg.streamId + "].")
      }
      sender ! new GetSharingStatusReply(RUNNING, None)
    }

    screenShareSession foreach { sss =>
      if (!msg.streamId.startsWith(sss)) {
        processStaleSession()
      } else {
        if (status == PAUSE) {
          processPausedStatus()
        } else if (status == START) {
          processStartStatus()
        } else if (status == RUNNING) {
          processRunningStatus()
        } else {
          if (log.isDebugEnabled) {
            log.debug("Replying STOP JWS. GetSharingStatus for streamId=[" + msg.streamId + "].")
          }
          sender ! new GetSharingStatusReply(STOP, None)
        }
      }
    }
  }

  private def stopScreenSharing(session: String, reason: String): Unit = {
    screenShareSession foreach { sss =>
      if (session == sss) {
        bus.send(new ScreenShareStoppedEvent(meetingId, sss, reason))
        resetScreenShareSession()
      }

      if (log.isDebugEnabled) {
        log.debug("stopScreenSharing session=[" + session + "]")
      }

      if (status != STOP) status = STOP
      currentPresenterId = None
      sessionAudit ! StopSendingAudit(sss)
    }

  }

  private def handleSessionAuditMessage(msg: SessionAuditMessage) {
    if (log.isDebugEnabled) {
      log.debug("handleSessionAuditMessage session=[" + msg.session + "].")
    }
    if (status != STOP) {
      if (jwsStarted(msg.session)) {
        if (isJwsStillAlive(msg.session)) {
          if (isClientStillAlive(msg.session)) {
            //sessionAudit ! StartSendingAudit(screenShareSession)
          }
        }
      }
    }
  }

  private def jwsStarted(session: String): Boolean = {
    val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()
    if ((status == START) && (currentTimeInSec - sessionStartedTimestamp > jwsLaunchTimeout)) {
      log.warning("JWS failed to start for meetingId=" + meetingId + ",session=" + session)
      stopScreenSharing(session, JWS_START_FAILED_REASON)
      false
    } else {
      true
    }
  }

  private def isJwsStillAlive(session: String): Boolean = {
    val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()

    if ((status == RUNNING || status == PAUSE) && (lastJwsStatusUpdate > 0) &&
      (currentTimeInSec - lastJwsStatusUpdate > LAST_JWS_STATUS_UPDATE_TIMEOUT)) {
      log.warning("Did not receive status update from JWS. Assume JWS crashed for meetingId=" +
        meetingId + ",session=" + session)
      stopScreenSharing(session, JWS_GONE_REASON)
      false
    } else {
      if (log.isDebugEnabled) {
        log.debug("JWS still alive. status=" + status + ";currentTimeInSec=" + currentTimeInSec + ";lastJwsStatusUpdate=" + lastJwsStatusUpdate +
          ";timeout=" + (currentTimeInSec - lastJwsStatusUpdate))
      }
      true
    }
  }

  private def isClientStillAlive(session: String): Boolean = {
    val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()
    if ((lastClientPongReceivedTimestamp > 0) && (currentTimeInSec - lastClientPongReceivedTimestamp > PONG_TIMEOUT_SEC)) {
      log.warning("Did not receive pong from client. Assume client crashed for meetingId=" +
        meetingId + ",streamId=" + session)
      stopScreenSharing(session, CLIENT_GONE_REASON)
      false
    } else {
      for {
        sss <- screenShareSession
        presenterId <- currentPresenterId
      } yield (bus.send(new ScreenShareClientPing(meetingId, presenterId, sss, currentTimeInSec)))

      true
    }
  }

  private def isStreaming(streamUrl: Option[String]): Boolean = {
    streamUrl match {
      case Some(url) => true
      case None => false
    }
  }

}