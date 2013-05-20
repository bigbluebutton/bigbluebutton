package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.immutable.HashMap
import org.bigbluebutton.core.apps.poll.PollApp

class Meeting extends Actor with PollApp {

  import org.bigbluebutton.core.messages._

  val users = new HashMap[String, User]
  val polls = new HashMap[String, Poll]
  
  	def act() = {
	  loop {
	    react {
	      case userJoin: UserJoin => {
	        handleUserJoin(userJoin)
	      }
	      case createPoll: CreatePoll => {
	        handleCreatePoll(createPoll)
	      }
	    }
	  }
  	}
  	
  	private def handleUserJoin(user: UserJoin) {
  	  
  	}
}