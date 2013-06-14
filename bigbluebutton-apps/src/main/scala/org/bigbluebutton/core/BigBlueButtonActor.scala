package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.CreateMeeting
import org.bigbluebutton.core.api.MeetingCreated
import org.bigbluebutton.core.api.MessageOutGateway

class BigBlueButtonActor(outGW: MessageOutGateway) extends Actor {
  import org.bigbluebutton.core.messages._
  
  private var meetings = new HashMap[String, Meeting]

  def scheduleGenerateKeyFrame():Unit = {
	  val mainActor = self
	  actor {
		  Thread.sleep(5)
		  mainActor ! "GenerateAKeyFrame"
	  }
  }
  
  def act() = {
	loop {
		react {
		  case "GenerateAKeyFrame" => {
		    System.out.println("************* BigBlueButtonActor is Alive!!!!!")
		    scheduleGenerateKeyFrame
		  }
	      case createMeeting: CreateMeeting => {
	        handleCreateMeeting(createMeeting)
	      }
	    }
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
    }
  }
  
}