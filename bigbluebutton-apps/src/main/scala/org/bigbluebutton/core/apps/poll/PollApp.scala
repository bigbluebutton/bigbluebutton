package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.User

class PollApp {
  import org.bigbluebutton.core.messages._
  import org.bigbluebutton.core.apps.poll.messages._
  
	private val polls = new HashMap[String, Poll]()
	
    def createPoll(msg: CreatePoll) {
  	  var poll = new Poll(msg.poll.id, msg.poll.title)
  	  polls += poll.id -> poll
  	}
}