package org.bigbluebutton.core.apps.poll

import org.bigbluebutton.core.messages._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.User

class PollApp {
	private val polls = new HashMap[String, Poll]()
	
    def createPoll(msg: CreatePoll) {
  	  var poll = new Poll(msg.id, msg.title)
  	  polls += msg.id -> poll
  	}
}