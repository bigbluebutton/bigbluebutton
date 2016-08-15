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
package org.bigbluebutton.app.screenshare

import akka.util.Timeout
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareManager
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.server.util.LogHelper
import akka.actor.ActorSystem
import akka.pattern.ask
import scala.concurrent.Await
import scala.concurrent.duration._

class ScreenShareApplication(val bus: IEventsMessageBus, val jnlpFile: String,
                             val streamBaseUrl: String) extends IScreenShareApplication with LogHelper {

  implicit val system = ActorSystem("bigbluebutton-screenshare-system")
  val screenshareManager = system.actorOf(ScreenshareManager.props(system, bus), "screenshare-manager")

  implicit def executionContext = system.dispatcher
  val initError: Error = new Error("Uninitialized error.")

  logger.info("Creating a new ScreenShareApplication")

  def userDisconnected(meetingId: String, userId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received user disconnected on meeting=" + meetingId 
          + "] userid=[" + userId + "]")
    }
    screenshareManager ! new UserDisconnected(meetingId, userId)
  }

  def isScreenSharing(meetingId: String):IsScreenSharingResponse = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received is screen sharing on meeting=" + meetingId + "]")
    }
    implicit val timeout = Timeout(3 seconds)
    val future = screenshareManager ? IsScreenSharing(meetingId)
    val reply = Await.result(future, timeout.duration).asInstanceOf[IsScreenSharingReply]

    val info = new StreamInfo(reply.sharing, reply.streamId, reply.width, reply.height, reply.url)
    new IsScreenSharingResponse(info, null)
  }
  
  def getScreenShareInfo(meetingId: String, token: String):ScreenShareInfoResponse = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received get screen sharing info on token=" + token + "]")
    }
    implicit val timeout = Timeout(3 seconds)
    val future = screenshareManager ? ScreenShareInfoRequest(meetingId, token)
    val reply = Await.result(future, timeout.duration).asInstanceOf[ScreenShareInfoRequestReply]

    val publishUrl = streamBaseUrl + "/" + meetingId
    val info = new ScreenShareInfo(publishUrl, reply.streamId)
    new ScreenShareInfoResponse(info, null)
  }

  def recordStream(meetingId: String, streamId: String):java.lang.Boolean = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received record stream request on stream=" + streamId + "]")
    }
    var record = false

    implicit val timeout = Timeout(3 seconds)
    val future = screenshareManager ? IsStreamRecorded(meetingId, streamId)
    val reply = Await.result(future, timeout.duration).asInstanceOf[IsStreamRecordedReply]
    record = reply.record
    record
  }

  def startShareRequest(meetingId: String, userId: String, record: java.lang.Boolean): StartShareRequestResponse = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received start share request on meeting=" + meetingId + "for user=" + userId + "]")
    }
    implicit val timeout = Timeout(3 seconds)
    val future = screenshareManager ? StartShareRequestMessage(meetingId, userId, record)
    val reply = Await.result(future, timeout.duration).asInstanceOf[StartShareRequestReplyMessage]

    val response = new StartShareRequestResponse(reply.token, jnlpFile, reply.streamId, null)
    response
  }

  def restartShareRequest(meetingId: String, userId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received restart share request on meeting=[" + meetingId
        + "] from userId=[" + userId + "]")
    }
    screenshareManager ! new RestartShareRequestMessage(meetingId, userId)
  }

  def pauseShareRequest(meetingId: String, userId: String, streamId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received pause share request on meeting=[" + meetingId
        + "] for stream=[" + streamId + "]")
    }
    screenshareManager ! new PauseShareRequestMessage(meetingId, userId, streamId)
  }

  def stopShareRequest(meetingId: String, streamId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stop share request on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "]")
    }
    screenshareManager ! new StopShareRequestMessage(meetingId, streamId)
  }

  def streamStarted(meetingId: String, streamId: String, url: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream started on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "]")
    }
    screenshareManager ! new StreamStartedMessage(meetingId, streamId, url)
  }

  def streamStopped(meetingId: String, streamId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream stopped on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "]")
    }
    screenshareManager ! new StreamStoppedMessage(meetingId, streamId)
  }

  def sharingStarted(meetingId: String, streamId: String, width: java.lang.Integer, height: java.lang.Integer) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received share started on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "] with region=[" + width + "x" + height + "]")
    }
    screenshareManager ! new SharingStartedMessage(meetingId, streamId, width, height)
  }

  def sharingStopped(meetingId: String, streamId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing stopped on meeting=" + meetingId 
          + "for stream=" + streamId + "]")
    }
    screenshareManager ! new SharingStoppedMessage(meetingId, streamId)
  }

  def updateShareStatus(meetingId: String, streamId : String, seqNum: java.lang.Integer) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received sharing status on meeting=" + meetingId
//          + "for stream=" + streamId + "]")
//    }
    screenshareManager ! new UpdateShareStatus(meetingId, streamId, seqNum)
  }

  def getSharingStatus(meetingId: String, streamId: String): SharingStatus = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing status on meeting=" + meetingId 
          + "for stream=" + streamId + "]")
    }

    var stopped = false

    implicit val timeout = Timeout(3 seconds)
    val future = screenshareManager ? GetSharingStatus(meetingId, streamId)
    val reply = Await.result(future, timeout.duration).asInstanceOf[GetSharingStatusReply]

    reply.streamId match {
      case Some(streamId)  => new SharingStatus(reply.status, streamId)
      case None => new SharingStatus(reply.status, null)
    }

  }

}