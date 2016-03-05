package org.bigbluebutton.app.screenshare.server.sessions

//import scala.actors.Actor
//import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.util._
import org.bigbluebutton.app.screenshare.server.sessions.messages._


//class MeetingActor(val sessionManager: ScreenshareSessionManager,
//                  val bus: IEventsMessageBus,
//                  val meetingId: String) extends Actor with LogHelper {
//

class MeetingActor() {
  /*
  private val sessions = new HashMap[String, ScreenshareSession]

  private var lastHasSessionCheck:Long = TimeUtil.getCurrentMonoTime
  
  private var activeSession:Option[ScreenshareSession] = None
  private var stopped = false
  
  private val IS_MEETING_RUNNING = "IsMeetingRunning"
      
  def scheduleIsMeetingRunningCheck() {
      val mainActor = self
      actor {
          Thread.sleep(60000)
          mainActor ! IS_MEETING_RUNNING
      }
  }
  
  def act() = {
    loop {
      react {
        case msg: StartShareRequestMessage      => handleStartShareRequestMessage(msg)
        case msg: StopShareRequestMessage       => handleStopShareRequestMessage(msg)
        case msg: StreamStartedMessage          => handleStreamStartedMessage(msg)
        case msg: StreamStoppedMessage          => handleStreamStoppedMessage(msg)
        case msg: SharingStartedMessage         => handleSharingStartedMessage(msg)
        case msg: SharingStoppedMessage         => handleSharingStoppedMessage(msg)
        case msg: IsSharingStopped              => handleIsSharingStopped(msg)
        case msg: IsScreenSharing               => handleIsScreenSharing(msg)
        case msg: IsStreamRecorded              => handleIsStreamRecorded(msg)
        case msg: UpdateShareStatus             => handleUpdateShareStatus(msg)
        case msg: UserDisconnected              => handleUserDisconnected(msg)
        case msg: ScreenShareInfoRequest        => handleScreenShareInfoRequest(msg)
        case IS_MEETING_RUNNING                 => handleIsMeetingRunning()
        case msg: KeepAliveTimeout              => handleKeepAliveTimeout(msg)
        case m: Any => logger.warn("Session: Unknown message [{}]", m)
      }
    }
  }

  private def findSessionByUser(userId: String):Option[ScreenshareSession] = {
    sessions.values find (su => su.userId == userId)
  }
    
  private def findSessionWithToken(token: String):Option[ScreenshareSession] = {
    sessions.values find (su => su.token == token)
  }

  private def handleUserDisconnected(msg: UserDisconnected) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received UserDisconnected for meetingId=[" + msg.meetingId + "]")      
    } 
        
    findSessionByUser(msg.userId) foreach (s => s forward msg) 
  }
    
  private def handleIsScreenSharing(msg: IsScreenSharing) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received IsScreenSharing for meetingId=[" + msg.meetingId + "]")      
    } 
        
    activeSession foreach (s => s forward msg) 
  }
    
  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received ScreenShareInfoRequest for token=[" + msg.token + "]")      
    } 
        
    findSessionWithToken(msg.token) foreach (s => s forward msg) 
  }
  
  private def handleIsStreamRecorded(msg: IsStreamRecorded) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received IsStreamRecorded for streamId=[" + msg.streamId + "]")      
    } 
    
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
      }
      case None => {
        logger.info("IsStreamRecorded on a non-existing session=[" + msg.streamId + "]")
      }
    }    
  }
  
  private def handleUpdateShareStatus(msg: UpdateShareStatus) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received UpdateShareStatus for streamId=[" + msg.streamId + "]")      
    } 
    
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
      }
      case None => {
        logger.info("Sharing stopped on a non-existing session=[" + msg.streamId + "]")
      }
    }    
  }

  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received SharingStoppedMessage for streamId=[" + msg.streamId + "]")      
    } 
        
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
        
      }
      case None => {
        logger.info("Sharing stopped on a non-existing session=[" + msg.streamId + "]")
      }
    }    
  } 
    
  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received SharingStartedMessage for streamId=[" + msg.streamId + "]")      
    } 
        
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
      }
      case None => {
        logger.info("Sharing started on a non-existing session=[" + msg.streamId + "]")
      }
    }    
  }  
  
  private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received StreamStoppedMessage for streamId=[" + msg.streamId + "]")      
    }   
    
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
        activeSession = None
      }
      case None => {
        logger.info("Stream stopped on a non-existing session=[" + msg.streamId + "]")
      }
    }    
  }
  
  private def handleStreamStartedMessage(msg: StreamStartedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received StreamStartedMessage for streamId=[" + msg.streamId + "]")      
    }     
           
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
        activeSession = Some(session)
      }
      case None => {
        logger.info("Stream started on a non-existing session=[" + msg.streamId + "]")
      }
    }    
  }
  
  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received StopShareRequestMessage for streamId=[" + msg.streamId + "]")      
    }    
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
      }
      case None => {
        logger.info("Stop share request on a non-existing session=[" + msg.streamId + "]")
      }
    }
  }
  
  private def handleStartShareRequestMessage(msg: StartShareRequestMessage) {
    val token = RandomStringGenerator.randomAlphanumericString(16)
    val streamId = msg.meetingId + "-" + System.currentTimeMillis();
    
    val session: ScreenshareSession = new ScreenshareSession(this, bus, 
                                              meetingId, streamId, token, 
                                              msg.record, msg.userId) 
    sessions += streamId -> session
    session.start
    
    session forward msg
    
  }
  
  private def handleIsSharingStopped(msg: IsSharingStopped) {
    sessions.get(msg.streamId) match {
      case Some(session) => {
        session forward msg
      }
      case None => {
        logger.info("Stream stopped on a non-existing session=[" + msg.streamId + "]")
      }
    }
  }
    
  private def handleStopSession() {
    stopped = true
  }
  
  private def handleStartSession() {
    stopped = false
    scheduleIsMeetingRunningCheck
  }
    
  private def handleIsMeetingRunning() {
    // If not sessions in the last 5 minutes, then assume meeting has ended.
    if (sessions.isEmpty) {
      if (TimeUtil.getCurrentMonoTime - lastHasSessionCheck > 300000) {
        sessionManager ! MeetingHasEnded(meetingId)
      } else {
        scheduleIsMeetingRunningCheck
      }
    } else {
      lastHasSessionCheck = TimeUtil.getCurrentMonoTime
      scheduleIsMeetingRunningCheck
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
  
 */
}