package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.CreateMeeting
import org.bigbluebutton.core.api.MeetingCreated
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.InMessage

class BigBlueButtonActor(outGW: MessageOutGateway) extends Actor {
  import org.bigbluebutton.core.messages._
  
  private var meetings = new HashMap[String, Meeting]
 
  def act() = {
	loop {
		react {
	      case createMeeting: CreateMeeting => {
	        handleCreateMeeting(createMeeting)
	      }
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
  
  private def handleCreateMeeting(msg: CreateMeeting):Unit = {
    meetings.get(msg.meetingID) match {
      case None => {
    	  println("****** Creating meeting [" + msg.meetingID + "] *****")
    	  
    	  var m = new Meeting(msg.meetingID, msg.recorded, msg.voiceBridge, outGW)
    	  m.start
    	  meetings += m.meetingID -> m
    	  outGW.send(new MeetingCreated(m.meetingID, m.recorded))
      }
      case Some(m) => // do nothing
    }
  }
  
}