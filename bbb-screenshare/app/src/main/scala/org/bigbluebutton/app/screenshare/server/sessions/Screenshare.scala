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

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.app.screenshare.StreamInfo
import scala.collection.mutable.HashMap
import org.bigbluebutton.app.screenshare.events._
import org.bigbluebutton.app.screenshare.server.sessions.Screenshare.{SessionAuditMessage}
import org.bigbluebutton.app.screenshare.server.sessions.messages.{StartShareRequestMessage, _}
import org.bigbluebutton.app.screenshare.server.util.TimeUtil
import scala.concurrent.duration._
import scala.collection.immutable.StringOps

object Screenshare {
  def props(screenshareSessionManager: ScreenshareManager, bus: IEventsMessageBus, meetingId:String, record: Boolean): Props =
    Props(classOf[Screenshare], screenshareSessionManager, bus, meetingId, record)

  case object SessionAuditMessage
  case class KeepAliveTimeout(streamId: String, stopSharing: Boolean)
}

class Screenshare(val sessionManager: ScreenshareManager,
                  val bus: IEventsMessageBus,
                  val meetingId: String, val record: Boolean) extends Actor with ActorLogging {

  log.info("Creating a new Screenshare for meetingId={}", meetingId)

  //private val sessions = new HashMap[String, ActiveSession]

  private var activeSession:Option[ActiveSession] = None

  private val START = "START"
  private val PAUSE = "PAUSE"
  private val STOP = "STOP"
  private val SHUTDOWN = "SHUTDOWN"

  // start, running, pause, stop
  private var status: String = START

  // index to increment streamId so we can support
  // start-pause-stop
  private var streamIdCount = 0

  private var screenShareSession = ""

  private var width: Option[Int] = None
  private var height: Option[Int] = None

  private var streamUrl: Option[String] = None

  private val SESSION_AUDIT_MESSAGE = "SessionAuditMessage"

  // Number of seconds before we assume that the JWS is dead.
  private val LAST_STATUS_UPDATE_TIMEOUT = 20
  private var lastStatusUpdate = 0L

  private var sessionStartedTimestamp:Long = 0L // TimeUtil.currentMonoTimeInSeconds()
  private val SESSION_START_TIMEOUT = 60

  // The last time we received a pong response from the client.
  // We need to check if the client is still alive. If the client
  // crashed, we need to end the screen sharing as soon as we detect it.
  private var lastPongReceivedTimestamp = 0L
  private val PONG_TIMEOUT_SEC = 20

  implicit def executionContext = sessionManager.actorSystem.dispatcher

  def scheduleKeepAliveCheck() {
    if (status != STOP) {
      sessionManager.actorSystem.scheduler.scheduleOnce(5.seconds, self, SessionAuditMessage)
    }
  }

  def receive = {
    case msg: RestartShareRequestMessage => handleRestartShareRequestMessage(msg)
    case msg: PauseShareRequestMessage => handlePauseShareRequestMessage(msg)
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
    case msg: MeetingHasEnded             => handleMeetingHasEnded(msg)
    case SessionAuditMessage => handleSessionAuditMessage()
    case msg: ClientPongMessage    => handleClientPongMessage(msg)
    case m: Any => log.warning("Session: Unknown message [{}]", m)
  }


  private def handleClientPongMessage(msg: ClientPongMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received ClientPongMessage message for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach {as =>
      if (as.streamId == msg.streamId) {
        lastPongReceivedTimestamp = TimeUtil.currentMonoTimeInSeconds()
      }
    }

  }

  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    if (log.isDebugEnabled) {
      log.debug("Received MeetingHasEnded for meetingId=[" + msg.meetingId + "]")
    }

    activeSession foreach { as =>
      bus.send(new ScreenShareStoppedEvent(meetingId, as.streamId))
    }

    context.stop(self)
  }


  private def trimUserId(userId: String):Option[String] = {
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
      log.debug("Received UserDisconnected for meetingId=[" + msg.meetingId + "] userId=[" + msg.userId + "]")
    }

    trimUserId(msg.userId) foreach {userId =>
      activeSession foreach { as =>
        if (as.userId == userId) {
          bus.send(new ScreenShareStoppedEvent(meetingId, as.streamId))
          activeSession = None
        }
      }
    }
  }

  private def handleUserConnected(msg: UserConnected) {
    if (log.isDebugEnabled) {
      log.debug("Received UserConnected for meetingId=[" + msg.meetingId + "]")
    }
    trimUserId(msg.userId) foreach {userId =>
      activeSession foreach { as =>
        if (as.userId == userId) {
          bus.send(new ScreenShareStoppedEvent(meetingId, as.streamId))
          activeSession = None
        }
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
        } yield {
          val info = new StreamInfo(true, as.streamId, w, h, url)
          bus.send(new IsScreenSharingResponse(meetingId, msg.userId, info))
        }
      case None =>
        val info = new StreamInfo(false, "", 0, 0, "")
        bus.send(new IsScreenSharingResponse(meetingId, msg.userId, info))
    }
  }

  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (log.isDebugEnabled) {
      log.debug("Received ScreenShareInfoRequest for token=[" + msg.token + "]")
    }

    activeSession foreach { as =>
      sender ! new ScreenShareInfoRequestReply(msg.meetingId, as.streamId)
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

    activeSession foreach { as =>
      if (as.streamId == msg.streamId) {
        lastStatusUpdate = TimeUtil.currentMonoTimeInSeconds()
      }
    }
  }

  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received JWS SharingStoppedMessage for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach { as =>

      if (as.streamId == meetingId) {
        status = STOP
        stopScreenSharing(as, as.streamId)
      }
    }
  }

  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received JWS SharingStartedMessage for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach { as =>
      width = Some(msg.width)
      height = Some(msg.height)

      // We wait until we have the width, height, and stream url before notifying
      // clients that stream has started. This way we prevent a race condition
      // where we have the stream url but the width and height is zero. (ralam aug 16, 2016)
      for {
        w <- width
        h <- height
        url <- streamUrl
      } yield (bus.send(new ScreenShareStartedEvent(meetingId, as.streamId, w, h, url)))
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
      } yield (bus.send(new ScreenShareStartedEvent(meetingId, as.streamId, w, h, url)))
    }
  }

  private def resetScreenShareSession() = {
    width = None
    height = None
    streamUrl = None
    activeSession = None
    lastPongReceivedTimestamp = 0L
    lastStatusUpdate = 0L

  }

  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StopShareRequestMessage for streamId=[" + msg.streamId + "]")
    }

    status = STOP

    activeSession foreach { session =>
      stopScreenSharing(session, session.streamId)
    }

  }

  private def handlePauseShareRequestMessage(msg: PauseShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received PauseShareRequestMessage for streamId=[" + msg.streamId + "]")
    }

    activeSession foreach { as =>
      if (as.streamId == msg.streamId) {
        status = PAUSE
        if (! isStreaming(streamUrl)) {
          log.info("Sending screen share paused event for streamId=" + as.streamId)
          bus.send(new ScreenSharePausedEvent(meetingId, as.streamId))
          resetScreenShareSession()
        }
      }
    }
  }

  private def handleRestartShareRequestMessage(msg: RestartShareRequestMessage) {

    def generateStreamId(): String = {
      val streamId = screenShareSession + "-" + streamIdCount
      streamIdCount = streamIdCount + 1
      streamId
    }

    if (log.isDebugEnabled) {
      log.debug("Received RestartShareRequestMessage from userId=[" + msg.userId + "]")
    }

    val streamId = generateStreamId
    val token = streamId

    val userId = trimUserId(msg.userId).getOrElse(msg.userId)

    val session = ActiveSession(this, bus, meetingId, streamId, token, record, userId)

    activeSession = Some(session)
    sessionStartedTimestamp = TimeUtil.currentMonoTimeInSeconds()
    status = START

    scheduleKeepAliveCheck()

  }

  private def handleStartShareRequestMessage(msg: StartShareRequestMessage) {
    def generateStreamId():String = {
      screenShareSession =  meetingId + "-" + System.currentTimeMillis()
      val streamId = screenShareSession + "-" + streamIdCount
      streamIdCount = streamIdCount + 1
      streamId
    }

    val streamId = generateStreamId
    val token = streamId

    val userId = trimUserId(msg.userId).getOrElse(msg.userId)

    val session = ActiveSession(this, bus, meetingId, streamId, token, msg.record, userId)
    activeSession = Some(session)

    status = START
    sessionStartedTimestamp = TimeUtil.currentMonoTimeInSeconds()
    bus.send(new ScreenShareStartRequestSuccessResponse(meetingId, msg.userId, token, msg.jnlp, streamId))

    scheduleKeepAliveCheck()
  }

  private def handleGetSharingStatus(msg: GetSharingStatus) {
    if (log.isDebugEnabled) {
      log.debug("Received GetSharingStatus for streamId=[" + msg.streamId + "]")
    }

    if (! msg.streamId.startsWith(screenShareSession)) {
      if (log.isDebugEnabled) {
        log.debug("Stopping JWS. GetSharingStatus for streamId=[" + msg.streamId + "] session stale.")
      }
      sender ! new GetSharingStatusReply(STOP, None)
    } else {
      if (status == PAUSE) {
        if (log.isDebugEnabled) {
          log.debug("Replying PAUSED JWS. GetSharingStatus for streamId=[" + msg.streamId + "].")
        }
        sender ! new GetSharingStatusReply(PAUSE, None)
      } else if (status == START && activeSession != None) {
        activeSession.foreach { as =>
          if (log.isDebugEnabled) {
            log.debug("Replying START JWS. GetSharingStatus for streamId=[" + msg.streamId + "].")
          }
          sender ! new GetSharingStatusReply(START, Some(as.streamId))
        }
      } else {
        if (log.isDebugEnabled) {
          log.debug("Replying STOP JWS. GetSharingStatus for streamId=[" + msg.streamId + "].")
        }
        sender ! new GetSharingStatusReply(STOP, None)
      }
    }
  }

  private def stopScreenSharing(session : ActiveSession, streamId: String): Unit = {
      if (session.streamId == streamId) {
        bus.send(new ScreenShareStoppedEvent(meetingId, session.streamId))
        resetScreenShareSession()
      }
  }

  private def handleSessionAuditMessage() {
    activeSession foreach { as =>
      if (jwsStarted(as)) {
        if (jwsIsStillAlive(as)) {
          if (clientIsStillAlive(as)) {
            scheduleKeepAliveCheck()
          }
        }
      }
    }
  }

  private def jwsStarted(session : ActiveSession): Boolean = {
      val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()
      if ((lastStatusUpdate == 0) && (currentTimeInSec - sessionStartedTimestamp > SESSION_START_TIMEOUT)) {
        log.warning("JWS failed to start. streamId={}", session.streamId)
        stopScreenSharing(session, session.streamId)
        false
      } else {
        true
      }
  }


  private def jwsIsStillAlive(session: ActiveSession): Boolean = {
      val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()

      if ((lastStatusUpdate > 0) && (currentTimeInSec - lastStatusUpdate > LAST_STATUS_UPDATE_TIMEOUT)) {
        log.warning("Did not receive status update from JWS. Assume it is dead. streamId={}", session.streamId)
        stopScreenSharing(session, session.streamId)
        false
      } else {
        true
      }
  }

  private def clientIsStillAlive(session: ActiveSession): Boolean = {
      val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()
      if ((lastPongReceivedTimestamp > 0) && (currentTimeInSec - lastPongReceivedTimestamp > PONG_TIMEOUT_SEC)) {
        log.warning("Did not receive pong from client. Assume it is dead. streamId={}", session.streamId)
        stopScreenSharing(session, session.streamId)
        false
      } else {
        if (log.isDebugEnabled) {
          log.debug("Sending client ping for streamId=[" + session.streamId + "].")
        }
        bus.send(new ScreenShareClientPing(meetingId, session.userId, session.streamId, currentTimeInSec))
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