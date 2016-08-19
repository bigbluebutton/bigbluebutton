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
import org.bigbluebutton.app.screenshare.server.sessions.Session.KeepAliveTimeout
import org.bigbluebutton.app.screenshare.server.util.TimeUtil
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.events._

import scala.concurrent.duration._

object Session {
  def props(parent: Screenshare, bus: IEventsMessageBus, meetingId: String, streamId: String, token: String,
            recorded: Boolean, userId: String): Props = Props(classOf[Session], parent, bus, meetingId,
    streamId, token, recorded, userId)

  case object StartSession
  case object StopSession
  case class KeepAliveTimeout(streamId: String)
}

class Session(parent: Screenshare,
              bus: IEventsMessageBus,
              val meetingId: String,
              val streamId: String,
              val token: String,
              val recorded: Boolean,
              val userId: String) extends Actor with ActorLogging {

  log.info("Creating of new Session")


  // if ffmpeg is still broadcasting
  private var streamStopped = true

  // if jws is still running
  private var shareStopped = true


  private var width: Option[Int] = None
  private var height: Option[Int] = None

  private var streamUrl: Option[String] = None

  private val SESSION_AUDIT_MESSAGE = "SessionAuditMessage"

  private var lastStatusUpdate = 0L

  // Number of seconds before we assume that the JWS is dead.
  private val LAST_STATUS_UPDATE_TIMEOUT = 20

  private var sessionStartedTimestamp:Long = TimeUtil.currentMonoTimeInSeconds()
  private val SESSION_START_TIMEOUT = 60

  // The last time we received a pong response from the client.
  // We need to check if the client is still alive. If the client
  // crashed, we need to end the screen sharing as soon as we detect it.
  private var lastPongReceivedTimestamp = 0L
  private val PONG_TIMEOUT_SEC = 20

  implicit def executionContext = parent.sessionManager.actorSystem.dispatcher

  def scheduleKeepAliveCheck() {
    parent.sessionManager.actorSystem.scheduler.scheduleOnce(5.seconds, self, SESSION_AUDIT_MESSAGE)
  }

  def receive = {
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
    case msg: ScreenShareInfoRequest => handleScreenShareInfoRequest(msg)
    case SESSION_AUDIT_MESSAGE => handleSessionAuditMessage()
    case msg: ClientPongMessage           => handleClientPongMessage(msg)
    case m: Any => log.warning("Session: Unknown message [%s]", m)
  }

  private def handleUserDisconnected(msg: UserDisconnected) {
    if (log.isDebugEnabled) {
      log.debug("Received UserDisconnected for streamId=[" + streamId + "]")
    }

    handleStopShareRequestMessage(new StopShareRequestMessage(meetingId, streamId))
  }

  private def handleIsStreamRecorded(msg: IsStreamRecorded) {
    if (log.isDebugEnabled) {
      log.debug("Received IsStreamRecorded for streamId=[" + msg.streamId + "]")
    }
    sender ! new IsStreamRecordedReply(recorded)
  }

  private def handleIsScreenSharing(msg: IsScreenSharing) {
    if (log.isDebugEnabled) {
      log.debug("Received IsScreenSharing for meetingId=[" + msg.meetingId + "]")
    }

    for {
      w <- width
      h <- height
      url <- streamUrl
    } yield {
      val info = new StreamInfo(true, streamId, w, h, url)
      bus.send(new IsScreenSharingResponse(meetingId, msg.userId, info))
    }

  }

  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (log.isDebugEnabled) {
      log.debug("Received ScreenShareInfoRequest for token=" + msg.token + " streamId=[" +
        streamId + "]")
    }
    sender ! new ScreenShareInfoRequestReply(msg.meetingId, streamId)
  }

  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received SharingStoppedMessage for streamId=[" + msg.streamId + "]")
    }
    shareStopped = true
    width = None
    height = None
    streamUrl = None
    bus.send(new ShareStoppedEvent(meetingId, streamId))
  }


  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received SharingStartedMessagefor streamId=[" + msg.streamId + "]")
    }
    shareStopped = false
    width = Some(msg.width)
    height = Some(msg.height)

    // We wait until we have the width, height, and stream url before notifying
    // clients that stream has started. This way we prevent a race condition
    // where we have the stream url but the width and height is zero. (ralam aug 16, 2016)
    for {
      w <- width
      h <- height
      url <- streamUrl
    } yield (bus.send(new StreamStartedEvent(meetingId, streamId, w, h, url)))

  }

  private def handleStreamStartedMessage(msg: StreamStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StreamStartedMessage for streamId=[" + msg.streamId + "]")
    }
    streamStopped = false
    streamUrl = Some(msg.url)

    // We wait until we have the width, height, and stream url before notifying
    // clients that stream has started. This way we prevent a race condition
    // where we have the stream url but the width and height is zero. (ralam aug 16, 2016)
    for {
      w <- width
      h <- height
      url <- streamUrl
    } yield (bus.send(new StreamStartedEvent(meetingId, streamId, w, h, url)))

  }

  private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StreamStoppedMessage streamId=[" + msg.streamId + "]")
    }
    streamStopped = true
    bus.send(new StreamStoppedEvent(meetingId, streamId))

  }

  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StopShareRequestMessage for streamId=[" + msg.streamId + "]")
    }

    bus.send(new ShareStoppedEvent(meetingId, streamId))

    stopSession()
  }

  private def handlePauseShareRequestMessage(msg: PauseShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received PauseShareRequestMessage for streamId=[" + msg.streamId + "]")
    }

    bus.send(new ShareStoppedEvent(meetingId, streamId))
  }

  private def handleStartShareRequestMessage(msg: StartShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StartShareRequestMessage for streamId=[" + msg.meetingId + "]")
    }
    scheduleKeepAliveCheck()
  }

  private def handleGetSharingStatus(msg: GetSharingStatus) {
    //sender ! new GetSharingStatusReply(pauseShareRequested, stopShareRequested)
  }

  private def handleUpdateShareStatus(msg: UpdateShareStatus): Unit = {
    lastStatusUpdate = TimeUtil.currentMonoTimeInSeconds()
  }

  private def handleSessionAuditMessage() {
    if (jwsStarted()) {
      if (jwsIsStillAlive()) {
        if (clientIsStillAlive()) {
          scheduleKeepAliveCheck()
        }
      }
    }
  }

  private def jwsStarted(): Boolean = {
    val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()
    if ((lastStatusUpdate == 0) && (currentTimeInSec - sessionStartedTimestamp > SESSION_START_TIMEOUT)) {
      log.warning("JWS failed to start. streamId={}", streamId)
      stopSession()
      false
    } else {
      true
    }
  }

  private def handleClientPongMessage(msg: ClientPongMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received ClientPongMessage message for streamId=[" + msg.streamId + "]")
    }

    lastPongReceivedTimestamp = TimeUtil.currentMonoTimeInSeconds()

  }

  private def jwsIsStillAlive(): Boolean = {
    val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()

    if ((lastStatusUpdate > 0) && (currentTimeInSec - lastStatusUpdate > LAST_STATUS_UPDATE_TIMEOUT)) {
      log.warning("Did not receive status update from JWS. Assume it is dead. streamId={}", streamId)
      stopSession()
      false
    } else {
      true
    }
  }

  private def clientIsStillAlive(): Boolean = {
    val currentTimeInSec = TimeUtil.currentMonoTimeInSeconds()
    if ((lastPongReceivedTimestamp > 0) && (currentTimeInSec - lastPongReceivedTimestamp > PONG_TIMEOUT_SEC)) {
      log.warning("Did not receive pong from client. Assume it is dead. streamId={}", streamId)
      stopSession()
      false
    } else {
      bus.send(new ScreenShareClientPing(meetingId, userId, streamId, currentTimeInSec))
      true
    }
  }

  private def stopSession(): Unit = {
    context.parent ! new KeepAliveTimeout(streamId)
    context.stop(self)
  }

}
