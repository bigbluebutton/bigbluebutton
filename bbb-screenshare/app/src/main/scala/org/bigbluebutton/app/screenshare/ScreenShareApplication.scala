package org.bigbluebutton.app.screenshare

import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareSessionManager
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.server.util.LogHelper

class ScreenShareApplication() {
//class ScreenShareApplication(val bus: IEventsMessageBus, val jnlpFile: String,
//                             val streamBaseUrl: String)
//                              extends IScreenShareApplication with LogHelper {
/*
  val sessionManager: ScreenshareSessionManager = new ScreenshareSessionManager(bus)
  sessionManager.start 
  
  val initError: Error = new Error("Uninitialized error.")
  
  def userDisconnected(meetingId: String, userId: String) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received user disconnected on meeting=" + meetingId 
          + "] userid=[" + userId + "]")
    }    
    
    sessionManager ! new UserDisconnected(meetingId, userId)
  }
  
  
  def isScreenSharing(meetingId: String):IsScreenSharingResponse = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received is screen sharing on meeting=" + meetingId 
          + "]")
    }
    
    var response: IsScreenSharingResponse = new IsScreenSharingResponse(null, initError)
    sessionManager !? (3000, IsScreenSharing(meetingId)) match {
        case None => {
          logger.info("Failed to get response to is screen sharing request on meeting=" + meetingId + "]")
          val info = new StreamInfo(false, "none", 0, 0, "none")
          response = new IsScreenSharingResponse(info, new Error("Timedout waiting for response"))
        }
        case Some(rep) => {
          val reply = rep.asInstanceOf[IsScreenSharingReply]
          val info = new StreamInfo(true, reply.streamId, reply.width, reply.height, reply.url)
          response = new IsScreenSharingResponse(info, null)
        }
      }   
    
    response
  }
  
  def getScreenShareInfo(meetingId: String, token: String):ScreenShareInfoResponse = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received get screen sharing info on token=" + token 
          + "]")
    }
    
    var response: ScreenShareInfoResponse = new ScreenShareInfoResponse(null, initError)
    sessionManager !? (3000, ScreenShareInfoRequest(meetingId, token)) match {
      case None => {
        logger.info("Failed to get response to get screen sharing info request on token=" + token + "]")
        response = new ScreenShareInfoResponse(null, new Error("Timedout waiting for response."))
      }
      case Some(rep) => {
        val reply = rep.asInstanceOf[ScreenShareInfoRequestReply]
        val publishUrl = streamBaseUrl + "/" + meetingId + "/" + reply.streamId
        val info = new ScreenShareInfo(publishUrl, reply.streamId)
        response = new ScreenShareInfoResponse(info, null)
      }
    }   
    
    response
  }
  
  def recordStream(meetingId: String, streamId: String):java.lang.Boolean = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received record stream request on stream=" + streamId  + "]")
    }    
    
    var record = false
    
    sessionManager !? (3000, IsStreamRecorded(meetingId, streamId)) match {
        case None => {
          logger.info("Failed to get response to record stream request on streamId=" 
              + streamId + "]")
          record = false
        }
        case Some(rep) => {
          val reply = rep.asInstanceOf[IsStreamRecordedReply]
          record = reply.record
        }
      }
  
      record     
  }
  
  def startShareRequest(meetingId: String, userId: String, record: java.lang.Boolean): StartShareRequestResponse  = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received start share request on meeting=" + meetingId 
          + "for user=" + userId + "]")
    }
    
    var response: StartShareRequestResponse = new StartShareRequestResponse(null, null, initError)
    
    sessionManager !? (3000, StartShareRequestMessage(meetingId, userId, record)) match {
        case None => {
          logger.info("Failed to get response to start share request on meeting=" 
              + meetingId + " for user=" + userId + "]")
          response = new StartShareRequestResponse(null, null, new Error("Timedout waiting for response"))
        }
        case Some(rep) => {
          val reply = rep.asInstanceOf[StartShareRequestReplyMessage]
          response = new StartShareRequestResponse(reply.token, jnlpFile, null)
        }
      }
  
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
    sessionManager !? (3000, IsSharingStopped(meetingId, streamId)) match {
      case None => stopped = true
      case Some(rep) => {
        val reply = rep.asInstanceOf[IsSharingStoppedReply]
        stopped = reply.stopped
      }
    }
  
    stopped
  }
  */
}