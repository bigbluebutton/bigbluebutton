package org.bigbluebutton.api2.meeting

import akka.actor.Actor
import akka.actor.ActorLogging

object MeetingActor {

}

class MeetingActor extends Actor with ActorLogging {

  def receive = {
    case msg: String => println(msg)
  }
}

