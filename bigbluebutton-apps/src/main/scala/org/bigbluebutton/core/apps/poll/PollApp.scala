package org.bigbluebutton.core.apps.poll

import org.bigbluebutton.core.messages._
import scala.collection.immutable.HashMap
import org.bigbluebutton.core.User

trait PollApp {
	val users: HashMap[String, User]
	
    def handleUserJoin(createPoll: CreatePoll) {
  	  users.get("id")
  	}
}