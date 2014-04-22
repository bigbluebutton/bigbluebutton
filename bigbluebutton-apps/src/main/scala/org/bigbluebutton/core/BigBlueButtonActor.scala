package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api._

class BigBlueButtonActor(outGW: MessageOutGateway) extends Actor {

  private var meetings = new HashMap[String, MeetingActor]
  
 
  def act() = {
	loop {
		react {
	      case msg: CreateMeeting                 => handleCreateMeeting(msg)
	      case msg: DestroyMeeting                => handleDestroyMeeting(msg)
	      case msg: KeepAliveMessage              => handleKeepAliveMessage(msg)
	      case msg: InMessage                     => handleMeetingMessage(msg)
	      case _ => // do nothing
	    }
	}
  }
  

  private def handleMeetingMessage(msg: InMessage):Unit = {
    meetings.get(msg.meetingID) match {
      case None => //
      case Some(m) => {
       // log.debug("Forwarding message [{}] to meeting [{}]", msg.meetingID)
        m ! msg
      }
    }
  }

  private def handleKeepAliveMessage(msg: KeepAliveMessage):Unit = {
    outGW.send(new KeepAliveMessageReply(msg.aliveID))
  }
    
  private def handleDestroyMeeting(msg: DestroyMeeting) {
    println("****************** BBBActor received DestroyMeeting message for meeting id [" + msg.meetingID + "] **************")
    meetings.get(msg.meetingID) match {
      case None => println("Could not find meeting id[" + msg.meetingID + "] to destroy.")
      case Some(m) => {
        m ! StopMeetingActor
        meetings -= msg.meetingID    
        println("Kinc everyone out on meeting id[" + msg.meetingID + "].")
        outGW.send(new EndAndKickAll(msg.meetingID, m.recorded))
        
        println("Destroyed meeting id[" + msg.meetingID + "].")
        outGW.send(new MeetingDestroyed(msg.meetingID))
      }
    }
  }
  
  private def handleCreateMeeting(msg: CreateMeeting):Unit = {
    meetings.get(msg.meetingID) match {
      case None => {
    	  var m = new MeetingActor(msg.meetingID, msg.meetingName, msg.recorded, msg.voiceBridge, msg.duration, outGW)
    	  m.start
    	  meetings += m.meetingID -> m
    	  outGW.send(new MeetingCreated(m.meetingID, m.recorded, m.voiceBridge))
    	  
    	  m ! new InitializeMeeting(m.meetingID, m.recorded)
    	  m ! "StartTimer"
      }
      case Some(m) => // do nothing
    }
  }
  
}
