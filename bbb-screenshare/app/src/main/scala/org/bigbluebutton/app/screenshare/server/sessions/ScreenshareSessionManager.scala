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


//import net.lag.logging.Logger
import akka.actor.{ActorSystem, Actor, Props}
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareSession.StopSession
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareSessionManager.MeetingHasEnded
import scala.collection.mutable.HashMap
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.server.util.LogHelper

object ScreenshareSessionManager {
  def props(system: ActorSystem, bus: IEventsMessageBus): Props =
  Props(classOf[ScreenshareSessionManager], system, bus)

  case class HasScreenShareSession(meetingId: String)
  case class HasScreenShareSessionReply(meetingId: String, sharing: Boolean, streamId:Option[String])
  case class MeetingHasEnded(meetingId: String)
}

class ScreenshareSessionManager(val aSystem: ActorSystem, val bus: IEventsMessageBus)
                                extends Actor with LogHelper {
  logger.info("_________________ScreenshareSessionManager")

  private val meetings = new HashMap[String, MeetingActor]
  val actorSystem = aSystem
  val actorRef = null //aSystem.actorOf(ScreenshareSessionManager.props(aSystem, bus), // TODO DANGER
    //"screenshare-session-manager-actor")

  def receive = {
    case "test001" => logger.info("SSM received test001!");
//    case msg: StartShareRequestMessage    => handleStartShareRequestMessage(msg)
//    case msg: StopShareRequestMessage     => handleStopShareRequestMessage(msg)
//    case msg: StreamStartedMessage        => handleStreamStartedMessage(msg)
//    case msg: StreamStoppedMessage        => handleStreamStoppedMessage(msg)
//    case msg: SharingStartedMessage       => handleSharingStartedMessage(msg)
//    case msg: SharingStoppedMessage       => handleSharingStoppedMessage(msg)
//    case msg: IsStreamRecorded            => handleIsStreamRecorded(msg)
//    case msg: IsSharingStopped            => handleIsSharingStopped(msg)
//    case msg: IsScreenSharing             => handleIsScreenSharing(msg)
//    case msg: ScreenShareInfoRequest      => handleScreenShareInfoRequest(msg)
//    case msg: UpdateShareStatus           => handleUpdateShareStatus(msg)
//    case msg: UserDisconnected            => handleUserDisconnected(msg)
//    case msg: MeetingHasEnded             => handleMeetingHasEnded(msg)

    case msg: Any => logger.warn("Unknown message " + msg)
  }

  
  private def handleUserDisconnected(msg: UserDisconnected) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received UserDisconnected message for meeting=[" + msg.meetingId + "]")      
    }    
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }  
  }
  
  private def handleIsStreamRecorded(msg: IsStreamRecorded) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received IsStreamRecorded message for meeting=[" + msg.meetingId + "]")      
    }    
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }  
  }
    
  private def handleIsScreenSharing(msg: IsScreenSharing) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received IsScreenSharing message for meeting=[" + msg.meetingId + "]")      
    }    
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }  
  }
  
  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    logger.info("Removing meeting [" + msg.meetingId + "]")
    meetings -= msg.meetingId 
  }
  
  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received ScreenShareInfoRequest message for meetingId=[" + msg.meetingId + "]")      
    }    
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }  
  }
  
  private def handleUpdateShareStatus(msg: UpdateShareStatus) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received update share message for meeting=[" + msg.streamId + "]")      
    }     
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }      
  }
  
  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing stopped message for meeting=[" + msg.streamId + "]")      
    }     
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }      
  }
  
  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing started message for meeting=[" + msg.streamId + "]")      
    }     
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }    
  }
  

  private def handleIsSharingStopped(msg: IsSharingStopped) {
//    meetings.get(msg.meetingId) foreach { s => s.actorRef ! msg }
  }

  private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream stopped message for meeting=[" + msg.streamId + "]")      
    }     
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }    
  }
    
  private def handleStreamStartedMessage(msg: StreamStartedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream started message for meeting=[" + msg.meetingId + "]")      
    }     
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }    
  }
  
  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stop share request message for meeting=[" + msg.meetingId + "]")      
    }    
    
    meetings.get(msg.meetingId) foreach { meeting =>
//      meeting.actorRef ! msg
    }
  }
  
  private def handleStartShareRequestMessage(msg: StartShareRequestMessage): Unit = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received start share request message for meeting=[" + msg.meetingId + "]")      
    }

      meetings.get(msg.meetingId) match {
        case None => {
          if (logger.isDebugEnabled()) {
            logger.debug("Creating meeting=[" + msg.meetingId + "]")            
          }

          //TODO !!!!
//          val meeting: MeetingActor = context.actorOf(classOf[MeetingActor](this, bus, msg.meetingId)) //TODO change the way the meetingActor is created
//          meetings += msg.meetingId -> meeting
//          meeting.actorRef ! msg
        }
        case Some(meeting) => {
          if (logger.isDebugEnabled()) {
            logger.debug("Meeting already exists. meeting=[" + msg.meetingId + "]")            
          }
//          meeting.actorRef ! msg
        }
      }
  }

  private def removeSession(meetingId: String): Unit = {
      logger.debug("SessionManager: Removing session " + meetingId);
      meetings.get(meetingId) foreach { s =>
//        s.actorRef ! StopSession
        val old:Int = meetings.size
        meetings -= meetingId
        logger.debug("RemoveSession: Session length [%d,%d]", old, meetings.size)
      }
  }

}
