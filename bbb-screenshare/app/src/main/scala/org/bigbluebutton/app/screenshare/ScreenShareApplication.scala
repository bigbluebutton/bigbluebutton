package org.bigbluebutton.app.screenshare

import akka.util.Timeout
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareManager
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.server.util.LogHelper
import akka.actor.ActorSystem
import akka.actor.Props
import akka.pattern.ask
import scala.concurrent.Await
import scala.util.{Success, Failure}
import scala.concurrent.duration._

class ScreenShareApplication(val bus: IEventsMessageBus, val jnlpFile: String,
                             val streamBaseUrl: String) extends IScreenShareApplication with LogHelper {

  implicit val system = ActorSystem("bigbluebutton-screenshare-system")
  val sessionManager = system.actorOf(ScreenshareManager.props(system, bus), "session-manager") //top level actor

  implicit def executionContext = system.dispatcher
  val initError: Error = new Error("Uninitialized error.")

  sessionManager ! "test001"
  logger.info("_____ScreenShareApplication")


  def userDisconnected(meetingId: String, userId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received user disconnected on meeting=" + meetingId 
          + "] userid=[" + userId + "]")
    }    
    
    sessionManager ! new UserDisconnected(meetingId, userId)
  }
  
  
  def isScreenSharing(meetingId: String):IsScreenSharingResponse = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received is screen sharing on meeting=" + meetingId + "]")
    }
    logger.info("AAAAAAAAAAAAAAAAAAAA")

    implicit val timeout = Timeout(3 seconds)
    val future = sessionManager ? IsScreenSharing(meetingId)
    val reply = Await.result(future, timeout.duration).asInstanceOf[IsScreenSharingReply]

    val info = new StreamInfo(false, reply.streamId, reply.width, reply.height, reply.url)
    new IsScreenSharingResponse(info, null)
  }
  
  def getScreenShareInfo(meetingId: String, token: String):ScreenShareInfoResponse = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received get screen sharing info on token=" + token + "]")
    }
    
    logger.info("BBBBBBBBBBBBBBBBBBBB")
    implicit val timeout = Timeout(3 seconds)
    val future = sessionManager ? ScreenShareInfoRequest(meetingId, token)
    val reply = Await.result(future, timeout.duration).asInstanceOf[ScreenShareInfoRequestReply]


    val publishUrl = streamBaseUrl + "/" + meetingId + "/" + reply.streamId
    val info = new ScreenShareInfo(publishUrl, reply.streamId)
    new ScreenShareInfoResponse(info, null)
  }
  
  def recordStream(meetingId: String, streamId: String):java.lang.Boolean = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received record stream request on stream=" + streamId  + "]")
    }    
    
    var record = false

    logger.info("CCCCCCCCCCCCCCCCC")

    implicit val timeout = Timeout(3 seconds)
    val future = sessionManager ? IsStreamRecorded(meetingId, streamId)
    val reply = Await.result(future, timeout.duration).asInstanceOf[IsStreamRecordedReply]
    record = reply.record
    record
  }
  
  def startShareRequest(meetingId: String, userId: String, record: java.lang.Boolean): StartShareRequestResponse  = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received start share request on meeting=" + meetingId
          + "for user=" + userId + "]")
    }
    logger.info("DDDDDDDDDDDDDDD")

    implicit val timeout = Timeout(3 seconds)
    val future = sessionManager ? StartShareRequestMessage(meetingId, userId, record)
    logger.info("SSA_0001")
    val reply = Await.result(future, timeout.duration).asInstanceOf[StartShareRequestReplyMessage]

    logger.info("SSA_0002")
    val response = new StartShareRequestResponse(reply.token, jnlpFile, null)
    logger.info("SSA_0003" + response.token)
    response
  }
  
  def stopShareRequest(meetingId: String, streamId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stop share request on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "]")          
    }
    sessionManager ! new StopShareRequestMessage(meetingId, streamId)     
  }
  
  def streamStarted(meetingId: String, streamId: String, url: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream started on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "]")          
    }
    sessionManager ! new StreamStartedMessage(meetingId, streamId, url)
  }
  
  def streamStopped(meetingId: String, streamId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream stopped on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "]")          
    }
    sessionManager ! new StreamStoppedMessage(meetingId, streamId)      
  }
  
  def sharingStarted(meetingId: String, streamId: String, width: java.lang.Integer, height: java.lang.Integer) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received share started on meeting=[" + meetingId 
          + "] for stream=[" + streamId + "] with region=[" + width + "x" + height + "]")          
    }
    sessionManager ! new SharingStartedMessage(meetingId, streamId, width, height)
  }
  
  def sharingStopped(meetingId: String, streamId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing stopped on meeting=" + meetingId 
          + "for stream=" + streamId + "]")          
    }
    sessionManager ! new SharingStoppedMessage(meetingId, streamId)      
  }
  
  def updateShareStatus(meetingId: String, streamId : String, seqNum: java.lang.Integer) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing status on meeting=" + meetingId 
          + "for stream=" + streamId + "]")          
    }
    sessionManager ! new UpdateShareStatus(meetingId, streamId, seqNum)
  }
  
  def isSharingStopped(meetingId: String, streamId: String): java.lang.Boolean = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing status on meeting=" + meetingId 
          + "for stream=" + streamId + "]")          
    }
    
    var stopped = false

    logger.info("EEEEEEEEEEE")

    implicit val timeout = Timeout(3 seconds)
    val future = sessionManager ? IsSharingStopped(meetingId, streamId)
    val reply = Await.result(future, timeout.duration).asInstanceOf[IsSharingStoppedReply]

    stopped = reply.stopped
    stopped
  }

}