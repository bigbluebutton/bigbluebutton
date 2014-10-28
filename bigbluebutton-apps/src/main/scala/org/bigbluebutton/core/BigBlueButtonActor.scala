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
    msg match {
      case ucm: UserConnectedToGlobalAudio => {
        val m = meetings.values.find( m => m.voiceBridge == ucm.voiceConf)
        m foreach {mActor => mActor ! ucm}
      }
      case udm: UserDisconnectedFromGlobalAudio => {
        val m = meetings.values.find( m => m.voiceBridge == udm.voiceConf)
        m foreach {mActor => mActor ! udm}        
      }
      case allOthers => {
		    meetings.get(allOthers.meetingID) match {
		      case None => handleMeetingNotFound(allOthers)
		      case Some(m) => {
		       // log.debug("Forwarding message [{}] to meeting [{}]", msg.meetingID)
		        m ! allOthers
		      }
		    }        
      }
    }
  }
  
  private def handleMeetingNotFound(msg: InMessage) {
    msg match {
      case vat:ValidateAuthToken => {
        println("No meeting [" + vat.meetingID + "] for auth token [" + vat.token + "]")
        outGW.send(new ValidateAuthTokenReply(vat.meetingID, vat.userId, vat.token, false, vat.correlationId))
      }
      case _ => {
        println("No meeting [" + msg.meetingID + "] for message type [" + msg.getClass() + "]")
        // do nothing
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
        println("New meeting create request [" + msg.meetingName + "]")
    	  var m = new MeetingActor(msg.meetingID, msg.meetingName, msg.recorded, 
    	                  msg.voiceBridge, msg.duration, 
    	                  msg.autoStartRecording, msg.allowStartStopRecording,
    	                  outGW)
    	  m.start
    	  meetings += m.meetingID -> m
    	  outGW.send(new MeetingCreated(m.meetingID, m.recorded, m.meetingName, m.voiceBridge, msg.duration))
    	  
    	  m ! new InitializeMeeting(m.meetingID, m.recorded)
    	  m ! "StartTimer"
      }
      case Some(m) => {
        println("Meeting already created [" + msg.meetingName + "]")
        // do nothing
      }
    }
  }
  
}
