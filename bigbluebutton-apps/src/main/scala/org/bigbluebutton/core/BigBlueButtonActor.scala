package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.immutable.HashMap

class BigBlueButtonActor extends Actor {
  import org.bigbluebutton.core.messages._
  
  var meetings = new HashMap[String, Meeting]
	
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
    
  }
}