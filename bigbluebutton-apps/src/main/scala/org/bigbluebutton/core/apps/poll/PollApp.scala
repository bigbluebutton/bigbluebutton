package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.User
import org.bigbluebutton.core.api.InMessage

class PollApp() {
  import org.bigbluebutton.core.apps.poll.messages._
  
  private val polls = new HashMap[String, Poll]()
	
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      case create: CreatePoll => createPoll(create)
    }    
  }
  
  private def createPoll(msg: CreatePoll) {
    var poll = new Poll(msg.poll.id, msg.poll.title)
    polls += poll.id -> poll
  }
}