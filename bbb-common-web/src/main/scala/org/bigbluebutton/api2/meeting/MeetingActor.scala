package org.bigbluebutton.api2.meeting

import org.apache.pekko.actor.Actor
import org.apache.pekko.actor.ActorLogging

object MeetingActor {

}

class MeetingActor extends Actor with ActorLogging {

  def receive = {
    case msg: String => println(msg)
  }
}

