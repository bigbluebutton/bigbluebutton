package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.immutable.HashMap
import org.bigbluebutton.core.apps.poll.PollApp
import org.bigbluebutton.core.apps.poll.Poll
import org.bigbluebutton.core.apps.poll.PollApp

class Meeting(id: String, recorded: Boolean, outGW: BigBlueButtonOutGateway) extends Actor {

  import org.bigbluebutton.core.messages._
  import org.bigbluebutton.core.apps.poll.messages._
  
  val users = new HashMap[String, User]
  val polls = new PollApp()
  
  	def act() = {
	  loop {
	    react {
	      case userJoin: UserJoin => {
	        handleUserJoin(userJoin)
	      }
	      case createPoll: CreatePoll => {
	        polls.createPoll(createPoll)
	      }
	    }
	  }
  	}
  	
  	private def handleUserJoin(user: UserJoin) {
  	  
  	}
}