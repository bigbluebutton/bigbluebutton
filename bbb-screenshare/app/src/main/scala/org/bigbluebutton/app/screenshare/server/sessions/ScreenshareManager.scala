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
import org.bigbluebutton.app.screenshare.server.sessions.Session.StopSession
import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }

import scala.collection.mutable.HashMap
import org.bigbluebutton.app.screenshare.events._
import org.bigbluebutton.app.screenshare.server.sessions.messages._

object ScreenshareManager {
  def props(system: ActorSystem, bus: IEventsMessageBus): Props =
    Props(classOf[ScreenshareManager], system, bus)
}

class ScreenshareManager(val aSystem: ActorSystem, val bus: IEventsMessageBus)
  extends Actor with ActorLogging {
  log.info("Creating a new ScreenshareManager")

  private val screenshares = new HashMap[String, ActiveScreenshare]
  val actorSystem = aSystem //TODO remove

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
    case msg: IsStreamRecorded => handleIsStreamRecorded(msg)
    case msg: GetSharingStatus => handleGetSharingStatus(msg)
    case msg: IsScreenSharing => handleIsScreenSharing(msg)
    case msg: ScreenShareInfoRequest => handleScreenShareInfoRequest(msg)
    case msg: UpdateShareStatus => handleUpdateShareStatus(msg)
    case msg: UserDisconnected => handleUserDisconnected(msg)
    case msg: UserConnected => handleUserConnected(msg)
    case msg: MeetingEnded => handleMeetingHasEnded(msg)
    case msg: MeetingCreated => handleMeetingCreated(msg)
    case msg: ClientPongMessage => handleClientPongMessage(msg)
    case msg: RecordingChapterBreak => handleRecordingChapterBreak(msg)
    case msg: AuthorizeBroadcastStreamMessage => handleAuthorizeBroadcastStreamMessage(msg)

    case msg: Any => log.warning("Unknown message " + msg)
  }

  private def handleRecordingChapterBreak(msg: RecordingChapterBreak): Unit = {
    bus.send(new RecordChapterBreakMessage(msg.meetingId, msg.timestamp))
  }

  private def handleClientPongMessage(msg: ClientPongMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received ClientPongMessage message for meeting=[" + msg.meetingId + "]")
    }

    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleUserDisconnected(msg: UserDisconnected) {
    if (log.isDebugEnabled) {
      log.debug("Received UserDisconnected message for meeting=[" + msg.meetingId + "]")
    }

    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleUserConnected(msg: UserConnected) {
    if (log.isDebugEnabled) {
      log.debug("Received UserConnected message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleIsStreamRecorded(msg: IsStreamRecorded) {
    if (log.isDebugEnabled) {
      log.debug("Received IsStreamRecorded message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef forward msg
    }
  }

  private def handleIsScreenSharing(msg: IsScreenSharing) {
    if (log.isDebugEnabled) {
      log.debug("Received IsScreenSharing message for meeting=[" + msg.meetingId + "]")
    }

    if (screenshares.get(msg.meetingId).isEmpty) {
      val info = new StreamInfo(false, "none", 0, 0, "none", "none")
      bus.send(new IsScreenSharingResponse(msg.meetingId, msg.userId, info))
    } else {
      screenshares.get(msg.meetingId) foreach { screenshare =>
        screenshare.actorRef forward msg
      }
    }
  }

  private def handleMeetingHasEnded(msg: MeetingEnded) {
    log.info("Removing meeting [" + msg.meetingId + "]")

    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef forward msg
    }

    screenshares -= msg.meetingId
  }

  private def handleMeetingCreated(msg: MeetingCreated) {
    log.info("Creating meeting [" + msg.meetingId + "]")

    screenshares.get(msg.meetingId) match {
      case None => {
        if (log.isDebugEnabled) {
          log.debug("Creating screenshare=[" + msg.meetingId + "]")
        }
        val activeScreenshare = ActiveScreenshare(this, bus, msg.meetingId, msg.record)
        screenshares += msg.meetingId -> activeScreenshare

      }
      case Some(screenshare) => {
        if (log.isDebugEnabled) {
          log.debug("Screenshare already exists. screenshare=[" + msg.meetingId + "]")
        }
      }
    }
  }

  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (log.isDebugEnabled) {
      log.debug("Received ScreenShareInfoRequest message for meetingId=[" + msg.meetingId + "]")
    }

    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef forward msg
    }
  }

  private def handleUpdateShareStatus(msg: UpdateShareStatus) {
    if (log.isDebugEnabled) {
      log.debug("Received update share message for meeting=[" + msg.streamId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received sharing stopped message for meeting=[" + msg.streamId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received sharing started message for meeting=[" + msg.streamId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleGetSharingStatus(msg: GetSharingStatus) {
    screenshares.get(msg.meetingId) foreach { s =>
      s.actorRef forward msg
    }
  }

  private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received stream stopped message for meeting=[" + msg.streamId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleStreamStartedMessage(msg: StreamStartedMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received stream started message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleAuthorizeBroadcastStreamMessage(msg: AuthorizeBroadcastStreamMessage): Unit = {
    if (log.isDebugEnabled) {
      log.debug("handleAuthorizeBroadcastStreamMessage meetingId=" + msg.meetingId +
        " streamId=" + msg.streamId + " connId=" + msg.connId + " scope=" + msg.scope)
    }

    screenshares.get(msg.meetingId) match {
      case Some(ss) =>
        ss.actorRef forward msg
      case None =>
        bus.send(new UnauthorizedBroadcastStreamEvent(msg.meetingId, msg.streamId, msg.connId, msg.scope))
    }
  }

  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received stop share request message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleRestartShareRequestMessage(msg: RestartShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received restart share request message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handlePauseShareRequestMessage(msg: PauseShareRequestMessage) {
    if (log.isDebugEnabled) {
      log.debug("Received pause share request message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }

  private def handleRequestShareTokenMessage(msg: RequestShareTokenMessage): Unit = {
    if (log.isDebugEnabled) {
      log.debug("Received request share token message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) match {
      case None =>
        if (log.isDebugEnabled) {
          log.warning("Requesting to share on non-existing meeting with id=[" + msg.meetingId + "]")
        }
        bus.send(new ScreenShareRequestTokenFailedResponse(msg.meetingId, msg.userId, "UNKNOWN_MEETING"))

      case Some(screenshare) =>
        if (log.isDebugEnabled) {
          log.debug("Request token screenshare=[" + msg.meetingId + "]")
        }

        screenshare.actorRef forward msg

    }
  }

  private def handleStartShareRequestMessage(msg: StartShareRequestMessage): Unit = {
    if (log.isDebugEnabled) {
      log.debug("Received start share request message for meeting=[" + msg.meetingId + "]")
    }
    screenshares.get(msg.meetingId) match {
      case None =>
        if (log.isDebugEnabled) {
          log.warning("Requesting to share on non-existing meeting with id=[" + msg.meetingId + "]")
        }
        bus.send(new ScreenShareRequestTokenFailedResponse(msg.meetingId, msg.userId, "UNKNOWN_MEETING"))

      case Some(screenshare) =>
        if (log.isDebugEnabled) {
          log.debug("Request to start screenshare=[" + msg.meetingId + "]")
        }

        screenshare.actorRef forward msg

    }
  }

  private def removeSession(meetingId: String): Unit = {
    log.debug("SessionManager: Removing session " + meetingId)
    screenshares.get(meetingId) foreach { s =>
      s.actorRef ! StopSession
      val old: Int = screenshares.size
      screenshares -= meetingId
      log.debug("RemoveSession: Session length [%d,%d]", old, screenshares.size)
    }
  }

}

