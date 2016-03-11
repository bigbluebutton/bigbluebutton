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

import akka.pattern.ask
import scala.concurrent.duration._
//import net.lag.logging.Logger
import akka.actor.{ActorSystem, Actor, Props}
import akka.util.Timeout
import org.bigbluebutton.app.screenshare.server.sessions.Session.StopSession
import org.bigbluebutton.app.screenshare.server.sessions.ScreenshareManager.MeetingHasEnded
import scala.collection.mutable.HashMap
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus
import org.bigbluebutton.app.screenshare.server.sessions.messages._
import org.bigbluebutton.app.screenshare.server.util.LogHelper

import scala.concurrent.Await

object ScreenshareManager {
  def props(system: ActorSystem, bus: IEventsMessageBus): Props =
  Props(classOf[ScreenshareManager], system, bus)

  case class HasScreenShareSession(meetingId: String)
  case class HasScreenShareSessionReply(meetingId: String, sharing: Boolean, streamId:Option[String])
  case class MeetingHasEnded(meetingId: String)
}

class ScreenshareManager(val aSystem: ActorSystem, val bus: IEventsMessageBus)
                                extends Actor with LogHelper {
  logger.info("_________________ScreenshareSessionManager")

  private val screenshares = new HashMap[String, ActiveScreenshare]
  val actorSystem = aSystem

  def receive = {
    case msg: StartShareRequestMessage    => handleStartShareRequestMessage(msg)
    case msg: StopShareRequestMessage     => handleStopShareRequestMessage(msg)
    case msg: StreamStartedMessage        => handleStreamStartedMessage(msg)
    case msg: StreamStoppedMessage        => handleStreamStoppedMessage(msg)
    case msg: SharingStartedMessage       => handleSharingStartedMessage(msg)
    case msg: SharingStoppedMessage       => handleSharingStoppedMessage(msg)
    case msg: IsStreamRecorded            => handleIsStreamRecorded(msg)
    case msg: IsSharingStopped            => handleIsSharingStopped(msg)
    case msg: IsScreenSharing             => handleIsScreenSharing(msg)
    case msg: ScreenShareInfoRequest      => handleScreenShareInfoRequest(msg)
    case msg: UpdateShareStatus           => handleUpdateShareStatus(msg)
    case msg: UserDisconnected            => handleUserDisconnected(msg)
    case msg: MeetingHasEnded             => handleMeetingHasEnded(msg)

    case msg: Any => logger.warn("Unknown message " + msg)
  }

  
  private def handleUserDisconnected(msg: UserDisconnected) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received UserDisconnected message for meeting=[" + msg.meetingId + "]")      
    }    
    
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }  
  }
  
  private def handleIsStreamRecorded(msg: IsStreamRecorded) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received IsStreamRecorded message for meeting=[" + msg.meetingId + "]")      
    }    


    screenshares.get(msg.meetingId) foreach { screenshare =>
      implicit val timeout = Timeout(3 seconds)
      val future = screenshare.actorRef ? msg
      logger.info("CCCCC before (SM)")
      val reply = Await.result(future, timeout.duration).asInstanceOf[IsStreamRecordedReply]
      logger.info("CCCCC after (SM)")
      sender ! reply
    }  
  }
    
  private def handleIsScreenSharing(msg: IsScreenSharing) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received IsScreenSharing message for meeting=[" + msg.meetingId + "]")      
    }
    logger.info("______SSM::handleIsScreenSharing " + screenshares.size)

    if (screenshares.get(msg.meetingId).isEmpty) {
      sender ! new IsScreenSharingReply(false, "none", 0, 0, "none")
    } else {
      screenshares.get(msg.meetingId) foreach { screenshare =>
        implicit val timeout = Timeout(3 seconds)
        val future = screenshare.actorRef ? msg
        logger.info("AAAAA before (SSM)")
        val reply = Await.result(future, timeout.duration).asInstanceOf[IsScreenSharingReply]
        logger.info("AAAAA after (SSM)")
        sender ! reply
      }
    }
  }
  
  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    logger.info("Removing meeting [" + msg.meetingId + "]")
    screenshares -= msg.meetingId
  }
  
  private def handleScreenShareInfoRequest(msg: ScreenShareInfoRequest) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received ScreenShareInfoRequest message for meetingId=[" + msg.meetingId + "]")      
    }    

    screenshares.get(msg.meetingId) foreach { screenshare =>
      implicit val timeout = Timeout(3 seconds)
      val future = screenshare.actorRef ? msg
      logger.info("BBBB before (SM)")
      val reply = Await.result(future, timeout.duration).asInstanceOf[ScreenShareInfoRequestReply]
      logger.info("BBBB after (SM)")

      sender ! reply
    }  
  }
  
  private def handleUpdateShareStatus(msg: UpdateShareStatus) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received update share message for meeting=[" + msg.streamId + "]")      
    }     
    
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }      
  }
  
  private def handleSharingStoppedMessage(msg: SharingStoppedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing stopped message for meeting=[" + msg.streamId + "]")      
    }     
    
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }      
  }
  
  private def handleSharingStartedMessage(msg: SharingStartedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received sharing started message for meeting=[" + msg.streamId + "]")      
    }     
    
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }    
  }
  

  private def handleIsSharingStopped(msg: IsSharingStopped) {
    screenshares.get(msg.meetingId) foreach { s =>
      implicit val timeout = Timeout(3 seconds)
      val future = s.actorRef ? msg
      logger.info("EEEEEE before (SSM)")
      val reply = Await.result(future, timeout.duration).asInstanceOf[IsSharingStoppedReply]
      logger.info("EEEEEE after (SSM)")

      sender ! reply
    }
  }

  private def handleStreamStoppedMessage(msg: StreamStoppedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream stopped message for meeting=[" + msg.streamId + "]")      
    }     
    
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }    
  }
    
  private def handleStreamStartedMessage(msg: StreamStartedMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stream started message for meeting=[" + msg.meetingId + "]")      
    }     
    
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }    
  }
  
  private def handleStopShareRequestMessage(msg: StopShareRequestMessage) {
    if (logger.isDebugEnabled()) {
      logger.debug("Received stop share request message for meeting=[" + msg.meetingId + "]")      
    }    
    
    screenshares.get(msg.meetingId) foreach { screenshare =>
      screenshare.actorRef ! msg
    }
  }
  
  private def handleStartShareRequestMessage(msg: StartShareRequestMessage): Unit = {
    if (logger.isDebugEnabled()) {
      logger.debug("Received start share request message for meeting=[" + msg.meetingId + "]")      
    }
    logger.info("_________________Received start share request message for meeting=[" + msg.meetingId + "]")
    screenshares.get(msg.meetingId) match {
      case None => {
        if (logger.isDebugEnabled()) {
          logger.debug("______Creating screenshare=[" + msg.meetingId + "]")
        }

        logger.info("________case none in handleStartShareRequestMessage")
        val activeScreenshare = ActiveScreenshare(this, bus, msg.meetingId)
        screenshares += msg.meetingId -> activeScreenshare

        implicit val timeout = Timeout(3 seconds)
        val future = activeScreenshare.actorRef ? msg
        logger.info("SSMa_0001")
        val reply = Await.result(future, timeout.duration).asInstanceOf[StartShareRequestReplyMessage]

        logger.info("SSMa_0002")
        sender ! reply
        logger.info("SSMa_0003" + reply.token)
      }
      case Some(screenshare) => {
        if (logger.isDebugEnabled()) {
          logger.debug("Screenshare already exists. screenshare=[" + msg.meetingId + "]")
        }
        logger.info("__________case Some in handleStartShareRequestMessage")

        implicit val timeout = Timeout(3 seconds)
        val future = screenshare.actorRef ? msg
        logger.info("SSMb_0001")
        val reply = Await.result(future, timeout.duration).asInstanceOf[StartShareRequestReplyMessage]

        logger.info("SSMb_0002")
        sender ! reply
        logger.info("SSMb_0003" + reply.token)
      }
    }
  }

  private def removeSession(meetingId: String): Unit = {
      logger.debug("SessionManager: Removing session " + meetingId);
      screenshares.get(meetingId) foreach { s =>
        s.actorRef ! StopSession
        val old:Int = screenshares.size
        screenshares -= meetingId
        logger.debug("RemoveSession: Session length [%d,%d]", old, screenshares.size)
      }
  }

}

