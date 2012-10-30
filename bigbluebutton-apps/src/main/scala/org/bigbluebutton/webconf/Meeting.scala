package org.bigbluebutton.webconf

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.immutable.HashMap

case class UserJoin(id: String, name: String)
case class UserLeft(id: String)


class Meeting extends Actor {

  private val users = new HashMap[String, User]
  
  	def act() = {
	  loop {
	    react {
	      case userJoin: UserJoin => {
	        handleUserJoin(userJoin)
	      }
	    }
	  }
  	}
  	
  	private def handleUserJoin(user: UserJoin) {
  	  
  	}
}