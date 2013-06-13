package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.CreateMeeting

class BigBlueButtonActor() extends Actor {
  import org.bigbluebutton.core.messages._
  
  private var meetings = new HashMap[String, Meeting]
 // var outGW: BigBlueButtonOutGateway
  
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
    meetings.get(msg.id) match {
      case None => {
       // var m = new Meeting(msg.id, msg.recorded, outGW)
      }
    }
  }
  
  def startBigBlueButtonActor():Unit = {
    System.out.println("************* BigBlueButtonActor is Starting!!!!!")
    start
    scheduleGenerateKeyFrame
  }
}