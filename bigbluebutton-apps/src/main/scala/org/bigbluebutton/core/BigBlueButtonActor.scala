package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap

class BigBlueButtonActor(outGW: BigBlueButtonOutGateway) extends Actor {
  import org.bigbluebutton.core.messages._
  
  private var meetings = new HashMap[String, Meeting]
	
  def act() = {
	loop {
		react {
	      case createMeeting: CreateMeeting => {
	        handleCreateMeeting(createMeeting)
	      }
	    }
	}
  }
  
  private def handleCreateMeeting(message: CreateMeeting):Unit = {
    meetings.get(message.id) match {
      case None => {
        var m = new Meeting()
      }
    }
  }
}