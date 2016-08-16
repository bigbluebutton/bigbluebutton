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

import akka.actor.{ActorLogging, Actor, Props}
import org.bigbluebutton.app.screenshare.server.sessions.Session.KeepAliveTimeout
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareManager.MeetingHasEnded
import scala.collection.mutable.HashMap
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.util._
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import scala.concurrent.duration._

object Screenshare {
  def props(screenshareSessionManager: ScreenshareManager, bus: IEventsMessageBus, meetingId:String): Props =
    Props(classOf[Screenshare], screenshareSessionManager, bus, meetingId)
}

class Screenshare(val sessionManager: ScreenshareManager,
                  val bus: IEventsMessageBus,
                  val meetingId: String) extends Actor with ActorLogging {

  log.info("Creating a new Screenshare")
  private val sessions = new HashMap[String, ActiveSession]

  private var lastHasSessionCheck:Long = TimeUtil.getCurrentMonoTime()
  
  private var activeSession:Option[ActiveSession] = None

  private val START = "START"
  private val RUNNING = "RUNNING"
  private val PAUSE = "PAUSE"
  private val STOP = "STOP"

  // start, running, pause, stop
  private var status: String = START

  // index to increment streamId so we can support
  // start-pause-stop
  private var streamIdCount = 0

  private var sessionToken = ""

  private val IS_MEETING_RUNNING = "IsMeetingRunning"

  private var currentStreamId:Option[String] = None
  private var currentPresenterId:Option[String] = None
  private var record:Boolean = false

  implicit def executionContext = sessionManager.actorSystem.dispatcher

  def scheduleIsMeetingRunningCheck() {
    sessionManager.actorSystem.scheduler.scheduleOnce(60.seconds, self, IS_MEETING_RUNNING)
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
    case msg: ScreenShareInfoRequest => handleScreenShareInfoRequest(msg)
    case IS_MEETING_RUNNING => handleIsMeetingRunning()
    case msg: KeepAliveTimeout => handleKeepAliveTimeout(msg)
    case m: Any => log.warning("Session: Unknown message [{}]", m)
  }

  private def findSessionByUser(userId: String):Option[ActiveSession] = {
    sessions.values find (su => su.userId == userId)
  }
    
  private def findSessionWithToken(token: String):Option[ActiveSession] = {
    sessions.values find (su => su.token == token)
  }

  private def handleUserDisconnected(msg: UserDisconnected) {
    if (log.isDebugEnabled) {
      log.debug("Received UserDisconnected for meetingId=[" + msg.meetingId + "]")
    }
    findSessionByUser(msg.userId) foreach (s => s.actorRef ! msg)
  }

  private def handleIsScreenSharing(msg: IsScreenSharing) {
    if (log.isDebugEnabled) {
      log.debug("Received IsScreenSharing for meetingId=[" + msg.meetingId + "]")
    }


    if (activeSession.isEmpty) {
      sender ! new IsScreenSharingReply(false, "none", 0, 0, "none")
    } else {
      activeSession foreach { session =>
        session.actorRef forward msg
      }
    }
  }

  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (log.isDebugEnabled) {
      log.debug("Received ScreenShareInfoRequest for token=[" + msg.token + "]")
    }

    findSessionWithToken(msg.token) foreach { session =>
      session.actorRef forward msg
    }
  }
  
  private def handleIsStreamRecorded(msg: IsStreamRecorded) {
    if (log.isDebugEnabled) {
      log.debug("Received IsStreamRecorded for streamId=[" + msg.streamId + "]")
    }

    sessions.get(msg.streamId) match {
      case Some(session) =>
        session.actorRef forward msg
      case None =>
        log.info("IsStreamRecorded on a non-existing session=[" + msg.streamId + "]")
    }
  }

  private def handleUpdateShareStatus(msg: UpdateShareStatus) {
    if (log.isDebugEnabled) {
      log.debug("Received UpdateShareStatus for streamId=[" + msg.streamId + "]")
    }
    sessions.get(msg.streamId) match {
      case Some(session) =>
        session.actorRef ! msg

      case None =>
        log.info("Sharing stopped on a non-existing session=[" + msg.streamId + "]")

    }
  }

  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received SharingStoppedMessage for streamId=[" + msg.streamId + "]")
    }
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session.actorRef ! msg
      }
      case None => {
        log.info("Sharing stopped on a non-existing session=[" + msg.streamId + "]")
      }
    }
  }

  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received SharingStartedMessage for streamId=[" + msg.streamId + "]")
    }
    sessions.get(msg.streamId) match {
      case Some(session) =>
        session.actorRef ! msg

      case None =>
        log.info("Sharing started on a non-existing session=[" + msg.streamId + "]")

    }
  }

  private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StreamStoppedMessage for streamId=[" + msg.streamId + "]")
    }

    currentStreamId = None
    currentPresenterId = None

    sessions.get(msg.streamId) match {
      case Some(session) =>
        session.actorRef ! msg
        activeSession = None

      case None =>
        log.info("Stream stopped on a non-existing session=[" + msg.streamId + "]")

    }
  }

  private def handleStreamStartedMessage(msg: StreamStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StreamStartedMessage for streamId=[" + msg.streamId + "]")
    }
    sessions.get(msg.streamId) match {
      case Some(session) =>
        session.actorRef ! msg
        activeSession = Some(session)

      case None =>
        log.info("Stream started on a non-existing session=[" + msg.streamId + "]")

    }
  }

  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received StopShareRequestMessage for streamId=[" + msg.streamId + "]")
    }
    sessions.get(msg.streamId) match {
      case Some(session) =>
        status = STOP
        currentPresenterId = None
        currentStreamId = None
        session.actorRef ! msg

      case None =>
        log.info("Stop share request on a non-existing session=[" + msg.streamId + "]")

    }
  }



  private def handlePauseShareRequestMessage(msg: PauseShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received PauseShareRequestMessage for streamId=[" + msg.streamId + "]")
    }
    sessions.get(msg.streamId) match {
      case Some(session) =>
        status = PAUSE
        currentPresenterId = None
        currentStreamId = None
        session.actorRef ! msg

      case None =>
        log.info("Stop share request on a non-existing session=[" + msg.streamId + "]")

    }
  }



  private def handleRestartShareRequestMessage(msg: RestartShareRequestMessage) {

    def generateStreamId(): String = {
      val streamId = sessionToken + "-" + streamIdCount
      streamIdCount = streamIdCount + 1
      streamId
    }

    if (log.isDebugEnabled) {
      log.debug("Received RestartShareRequestMessage from userId=[" + msg.userId + "]")
    }

    val streamId = generateStreamId
    val token = streamId

    currentPresenterId = Some(msg.userId)
    currentStreamId = Some(streamId)

    val session = ActiveSession(this, bus, meetingId, streamId, token, record, msg.userId)

    sessions += streamId -> session
    status = START
    session.actorRef ! msg
    sender ! new StartShareRequestReplyMessage(token, streamId)
  }

  private def handleStartShareRequestMessage(msg: StartShareRequestMessage) {
    def generateStreamId():String = {
      sessionToken =  meetingId + "-" + System.currentTimeMillis()
      val streamId = sessionToken + "-" + streamIdCount
      streamIdCount = streamIdCount + 1
      streamId
    }

    val streamId = generateStreamId
    val token = streamId

    currentPresenterId = Some(msg.userId)
    currentStreamId = Some(streamId)
    record = msg.record

    val session = ActiveSession(this, bus, meetingId, streamId, token, msg.record, msg.userId)

    sessions += streamId -> session
    status = START

    session.actorRef ! msg
    sender ! new StartShareRequestReplyMessage(token, streamId)
  }

  private def handleGetSharingStatus(msg: GetSharingStatus) {
    if (! msg.streamId.startsWith(sessionToken)) {
      sender ! new GetSharingStatusReply(STOP, None)
    } else {
      currentStreamId match {
        case Some(curStreamId) =>
            sender ! new GetSharingStatusReply(status, currentStreamId)

        case None => {
          if (status == PAUSE) {
            sender ! new GetSharingStatusReply(status, currentStreamId)
          } else {
            sender ! new GetSharingStatusReply(STOP, None)
          }

        }
      }
    }
  }

  private def handleIsMeetingRunning() {
    // If not sessions in the last 5 minutes, then assume meeting has ended.
    if (sessions.isEmpty) {
      if (TimeUtil.getCurrentMonoTime - lastHasSessionCheck > 300000) {
        context.parent ! MeetingHasEnded(meetingId)
      } else {
        scheduleIsMeetingRunningCheck()
      }
    } else {
      lastHasSessionCheck = TimeUtil.getCurrentMonoTime()
      scheduleIsMeetingRunningCheck()
    } 
  }

  private def handleKeepAliveTimeout(msg: KeepAliveTimeout) {
    sessions.remove(msg.streamId) foreach { s =>
      if (activeSession != None) {
        activeSession foreach { as =>
          if (as.streamId == s.streamId) activeSession = None
        }
      }
    }
  }

}