/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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


import akka.actor.{Actor, Props}
import org.bigbluebutton.app.screenshare.server.sessions.Session.KeepAliveTimeout
//import net.lag.logging.Logger
import org.bigbluebutton.app.screenshare.server.util.LogHelper
import org.bigbluebutton.app.screenshare.server.util.TimeUtil
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.events.ShareStartedEvent
import org.bigbluebutton.app.screenshare.events.ShareStoppedEvent
import org.bigbluebutton.app.screenshare.events.StreamStoppedEvent
import org.bigbluebutton.app.screenshare.events.StreamStartedEvent
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
              val userId: String) extends Actor with LogHelper {

  logger.info("_____ScreenshareSession")
	private var timeOfLastKeepAliveUpdate:Long = TimeUtil.getCurrentMonoTime
	private val KEEP_ALIVE_TIMEOUT = 60000

	// if ffmpeg is still broadcasting
	private var streamStopped = true
	// if jws is still running
	private var shareStopped = true

	// if the user has requested to stop sharing
	private var stopShareRequested = false

	private var width: Int = 0
	private var height: Int = 0

	private var streamUrl: String = ""

	private var timestamp = 0L;
	private var lastUpdate:Long = System.currentTimeMillis();

	private val IS_STREAM_ALIVE = "IsStreamAlive"

  implicit def executionContext = parent.sessionManager.actorSystem.dispatcher

	def scheduleKeepAliveCheck() {
    val mainActor = self

    parent.sessionManager.actorSystem.scheduler.schedule(
      (5.seconds),
      (5.seconds),
      mainActor,
      IS_STREAM_ALIVE)

    }

	def receive = {
    case msg: StartShareRequestMessage => handleStartShareRequestMessage(msg)
    case msg: StopShareRequestMessage => handleStopShareRequestMessage(msg)
    case msg: StreamStartedMessage => handleStreamStartedMessage(msg)
    case msg: StreamStoppedMessage => handleStreamStoppedMessage(msg)
    case msg: SharingStartedMessage => handleSharingStartedMessage(msg)
    case msg: SharingStoppedMessage => handleSharingStoppedMessage(msg)
    case msg: IsSharingStopped => handleIsSharingStopped(msg)
    case msg: IsScreenSharing => handleIsScreenSharing(msg)
    case msg: IsStreamRecorded => handleIsStreamRecorded(msg)
    case msg: UpdateShareStatus => handleUpdateShareStatus(msg)
    case msg: UserDisconnected => handleUserDisconnected(msg)
    case msg: ScreenShareInfoRequest => handleScreenShareInfoRequest(msg)
    case IS_STREAM_ALIVE => checkIfStreamIsAlive()
    case m: Any => logger.warn("Session: Unknown message [%s]", m)
  }

	private def handleUserDisconnected(msg: UserDisconnected) {
      if (logger.isDebugEnabled()) {
        logger.debug("Received UserDisconnected for streamId=[" + streamId + "]")
      }

      stopShareRequested = true
    }

	private def handleIsStreamRecorded(msg: IsStreamRecorded) {
      if (logger.isDebugEnabled()) {
        logger.debug("Received IsStreamRecorded for streamId=[" + msg.streamId + "]")
      }

      sender() ! new IsStreamRecordedReply(recorded)
    }

	private def handleIsScreenSharing(msg: IsScreenSharing) {
      if (logger.isDebugEnabled()) {
        logger.debug("Received IsScreenSharing for meetingId=[" + msg.meetingId + "]")
      }
    logger.info("_______ScreenshareSession::handleIsScreenSharing")
    sender() ! new IsScreenSharingReply(true, streamId, width, height, streamUrl)
    }

	private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
	  if (logger.isDebugEnabled()) {
        logger.debug("Received ScreenShareInfoRequest for token=" + msg.token + " streamId=[" + streamId + "]")
      }

      sender ! new ScreenShareInfoRequestReply(msg.meetingId, streamId)
    }

	private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
	  if (logger.isDebugEnabled()) {
        logger.debug("Received SharingStoppedMessage for streamId=[" + msg.streamId + "]")
      }

      shareStopped = true
      width = 0
      height = 0
      bus.send(new ShareStoppedEvent(meetingId, streamId))
    }

    private def handleSharingStartedMessage(msg: SharingStartedMessage) {
      if (logger.isDebugEnabled()) {
        logger.debug("Received SharingStartedMessagefor streamId=[" + msg.streamId + "]")
      }

      stopShareRequested = false
      shareStopped = false
      width = msg.width
      height = msg.height
      bus.send(new ShareStartedEvent(meetingId, streamId))
    }

	private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
	  if (logger.isDebugEnabled()) {
        logger.debug("Received StreamStoppedMessage streamId=[" + msg.streamId + "]")
      }

      streamStopped = true
      bus.send(new StreamStoppedEvent(meetingId, streamId))
    }

	private def handleStreamStartedMessage(msg: StreamStartedMessage) {
	  if (logger.isDebugEnabled()) {
        logger.debug("Received StreamStartedMessage for streamId=[" + msg.streamId + "]")
      }

	  streamStopped = false
	  streamUrl = msg.url
	  bus.send(new StreamStartedEvent(meetingId, streamId, width, height, msg.url))
	}

	private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
	  if (logger.isDebugEnabled()) {
        logger.debug("Received StopShareRequestMessage for streamId=[" + msg.streamId + "]")
      }

	  stopShareRequested = true
	  bus.send(new ShareStoppedEvent(meetingId, streamId))
	}

	private def handleStartShareRequestMessage(msg: StartShareRequestMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received StartShareRequestMessage for streamId=[" + msg.meetingId + "]")
    }
    scheduleKeepAliveCheck()
//    sender ! new StartShareRequestReplyMessage(token) //TODO I don't think I should be replying to this but have to double check
  }

    private def handleIsSharingStopped(msg: IsSharingStopped) {
       sender() ! new IsSharingStoppedReply(stopShareRequested)
    }

	private def handleUpdateShareStatus(msg: UpdateShareStatus): Unit = {
		timeOfLastKeepAliveUpdate = TimeUtil.getCurrentMonoTime
	}

	private def checkIfStreamIsAlive() {
        if (TimeUtil.getCurrentMonoTime - timeOfLastKeepAliveUpdate > KEEP_ALIVE_TIMEOUT) {
            logger.warn("Did not received updates for more than 1 minute. Removing stream {}", streamId)
            context.parent ! new KeepAliveTimeout(streamId) // TODO not sure if this is the right way
        } else {
          scheduleKeepAliveCheck()
        }
    }

}
