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

import scala.util.{Failure, Success}
import akka.util.Timeout
import akka.pattern.ask
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareManager
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.server.util.LogHelper
import akka.actor.ActorSystem
import org.bigbluebutton.app.screenshare.redis.{AppsRedisSubscriberActor, IncomingJsonMessageBus, ReceivedJsonMsgHandlerActor}

import scala.concurrent.{Await, Future, TimeoutException}
import scala.concurrent.duration._

class ScreenShareApplication(val bus: IEventsMessageBus, val jnlpFile: String,
                             val streamBaseUrl: String) extends IScreenShareApplication
  with SystemConfiguration { //} with LogHelper {

  implicit val system = ActorSystem("bbb-screenshare-system")
  implicit val timeout = akka.util.Timeout(3 seconds)
  implicit def executionContext = system.dispatcher

  //println(system.settings)

  //println("*********** meetingManagerChannel = " + meetingManagerChannel)
  //println("*********** meetingManagerChannel = " + meetingManagerChannel)
  //logger.debug("*********** meetingManagerChannel = " + meetingManagerChannel)

  val incomingJsonMessageBus = new IncomingJsonMessageBus
  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(incomingJsonMessageBus), "redis-subscriber")

  val screenShareManager = system.actorOf(ScreenshareManager.props(system, bus), "screenshare-manager")

  val redisMessageHandlerActor = system.actorOf(ReceivedJsonMsgHandlerActor.props(screenShareManager))
  incomingJsonMessageBus.subscribe(redisMessageHandlerActor, toScreenshareAppsJsonChannel)

  val initError: Error = new Error("Uninitialized error.")

  //if (logger.isDebugEnabled()) {
  //  logger.debug("ScreenShareApplication created.")
  //}


  def meetingHasEnded(meetingId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received meetingHasEnded on meeting=" + meetingId + "]")
//    }

    screenShareManager ! new MeetingEnded(meetingId)
  }

  def meetingCreated(meetingId: String, record: java.lang.Boolean) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received meetingCreated on meeting=" + meetingId + "]")
//    }

    screenShareManager ! new MeetingCreated(meetingId, record)

  }

  def userConnected(meetingId: String, userId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received user connected on meeting=" + meetingId
//        + "] userid=[" + userId + "]")
//    }
    screenShareManager ! new UserConnected(meetingId, userId)
  }

  def userDisconnected(meetingId: String, userId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received user disconnected on meeting=" + meetingId
//          + "] userid=[" + userId + "]")
//    }
    screenShareManager ! new UserDisconnected(meetingId, userId)
  }

  def isScreenSharing(meetingId: String, userId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received is screen sharing on meeting=" + meetingId + "]")
//    }

    screenShareManager ! IsScreenSharing(meetingId, userId)
  }

  def getScreenShareInfo(meetingId: String, token: String):ScreenShareInfoResponse = {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received get screen sharing info on token=" + token + "]")
//    }

    try {
      val future = screenShareManager ? ScreenShareInfoRequest(meetingId, token)
      val reply = Await.result(future, timeout.duration).asInstanceOf[ScreenShareInfoRequestReply]

      val publishUrl = streamBaseUrl + "/" + meetingId
      val info = new ScreenShareInfo(reply.session, publishUrl, reply.streamId, reply.tunnel)
      new ScreenShareInfoResponse(info, null)
    } catch {
      case e: TimeoutException =>
 //       if (logger.isDebugEnabled()) {
 //         logger.debug("FAILED to get screen share info on meetingId=" + meetingId + "]")
 //       }
        new ScreenShareInfoResponse(null, initError)
    }

  }

  def getSharingStatus(meetingId: String, streamId: String): SharingStatus = {

    try {
      val future = screenShareManager ? GetSharingStatus(meetingId, streamId)
      val reply = Await.result(future, timeout.duration).asInstanceOf[GetSharingStatusReply]

      reply.streamId match {
        case Some(streamId)  => new SharingStatus(reply.status, streamId)
        case None => new SharingStatus(reply.status, null)
      }
    } catch {
      case e: TimeoutException =>
//        if (logger.isDebugEnabled()) {
//          logger.debug("FAILED to get sharing status on stream=" + streamId + "]")
//        }
        new SharingStatus("STOP", null)
    }


  }

  def recordStream(meetingId: String, streamId: String):java.lang.Boolean = {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received record stream request on stream=" + streamId + "]")
//    }

    var record = false

    try {
      val future = screenShareManager ? IsStreamRecorded(meetingId, streamId)
      val reply = Await.result(future, timeout.duration).asInstanceOf[IsStreamRecordedReply]
      record = reply.record
//      if (logger.isDebugEnabled()) {
//        logger.debug("Received response SUCCESS request on stream=" + streamId + "]")
//      }
    } catch {
      case e: TimeoutException =>
//        if (logger.isDebugEnabled()) {
//          logger.debug("FAILED to get is stream recorded on stream=" + streamId + "]")
//        }
        record = false
    }

    record

  }

  def requestShareToken(meetingId: String, userId: String, record: java.lang.Boolean, tunnel: java.lang.Boolean) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received request share token on meeting=" + meetingId + "for user=" + userId + "]")
//    }

    screenShareManager ! RequestShareTokenMessage(meetingId, userId, jnlpFile, record, tunnel)
  }

  def startShareRequest(meetingId: String, userId: String, session: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received start share request on meeting=" + meetingId + "for user=" + userId + "]")
//    }

    screenShareManager ! StartShareRequestMessage(meetingId, userId, session)
  }

  def restartShareRequest(meetingId: String, userId: String) {
//    if (logger.isDebugEnabled()) {
 //     logger.debug("Received restart share request on meeting=[" + meetingId
  //      + "] from userId=[" + userId + "]")
   // }
    screenShareManager ! new RestartShareRequestMessage(meetingId, userId)
  }

  def pauseShareRequest(meetingId: String, userId: String, streamId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received pause share request on meeting=[" + meetingId
//        + "] for stream=[" + streamId + "]")
//    }
    screenShareManager ! new PauseShareRequestMessage(meetingId, userId, streamId)
  }

  def stopShareRequest(meetingId: String, streamId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received stop share request on meeting=[" + meetingId
//          + "] for stream=[" + streamId + "]")
//    }
    screenShareManager ! new StopShareRequestMessage(meetingId, streamId)
  }

  def streamStarted(meetingId: String, streamId: String, url: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received stream started on meeting=[" + meetingId
//          + "] for stream=[" + streamId + "]")
//    }
    screenShareManager ! new StreamStartedMessage(meetingId, streamId, url)
  }

  def streamStopped(meetingId: String, streamId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received stream stopped on meeting=[" + meetingId
//          + "] for stream=[" + streamId + "]")
//    }
    screenShareManager ! new StreamStoppedMessage(meetingId, streamId)
  }

  def sharingStarted(meetingId: String, streamId: String, width: java.lang.Integer, height: java.lang.Integer) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received share started on meeting=[" + meetingId
//          + "] for stream=[" + streamId + "] with region=[" + width + "x" + height + "]")
//    }
    screenShareManager ! new SharingStartedMessage(meetingId, streamId, width, height)
  }

  def sharingStopped(meetingId: String, streamId: String) {
//    if (logger.isDebugEnabled()) {
//      logger.debug("Received sharing stopped on meeting=" + meetingId
//          + "for stream=" + streamId + "]")
//    }
    screenShareManager ! new SharingStoppedMessage(meetingId, streamId)
  }

  def updateShareStatus(meetingId: String, streamId : String, seqNum: java.lang.Integer) {
    screenShareManager ! new UpdateShareStatus(meetingId, streamId, seqNum)
  }



  def screenShareClientPongMessage (meetingId: String, userId: String, streamId: String, timestamp: java.lang.Long)  {
    screenShareManager ! new ClientPongMessage(meetingId, userId, streamId, timestamp)
  }
}