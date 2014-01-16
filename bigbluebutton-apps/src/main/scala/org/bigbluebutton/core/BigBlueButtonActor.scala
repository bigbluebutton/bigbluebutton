package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api._
import net.lag.logging.Logger

class BigBlueButtonActor(outGW: MessageOutGateway) extends Actor {
  private val log = Logger.get 

  private var meetings = new HashMap[String, MeetingActor]
 
  log.debug("Starting up BigBlueButton Actor")
  
  def act() = {
	loop {
		react {
	      case createMeeting: CreateMeeting => handleCreateMeeting(createMeeting)
	      case destroyMeeting: DestroyMeeting => handleDestroyMeeting(destroyMeeting)
	      case keepAliveMessage: KeepAliveMessage => handleKeepAliveMessage(keepAliveMessage)
	      case msg:InMessage => handleMeetingMessage(msg)
	      case _ => // do nothing
	    }
	}
  }
  

  private def handleMeetingMessage(msg: InMessage):Unit = {
    meetings.get(msg.meetingID) match {
      case None => // do nothing
      case Some(m) => m ! msg
    }
  }

  private def handleKeepAliveMessage(msg: KeepAliveMessage):Unit = {
    outGW.send(new KeepAliveMessageReply(msg.aliveID))
  }
  
  private def handleDestroyMeeting(msg: DestroyMeeting) {
    meetings.get(msg.meetingID) match {
      case None => // do nothing
      case Some(m) => {
        outGW.send(new MeetingEnded(m.meetingID, m.recorded, m.voiceBridge))
        m ! StopMeetingActor
        meetings -= msg.meetingID
      }
    }    
  }
  
  private def handleCreateMeeting(msg: CreateMeeting):Unit = {
    meetings.get(msg.meetingID) match {
      case None => {
    	  var m = new MeetingActor(msg.meetingID, msg.recorded, msg.voiceBridge, outGW)
    	  m.start
    	  meetings += m.meetingID -> m
    	  outGW.send(new MeetingCreated(m.meetingID, m.recorded, m.voiceBridge))
    	  
    	  m ! new InitializeMeeting(m.meetingID, m.recorded)
      }
      case Some(m) => // do nothing
    }
  }
  
}
