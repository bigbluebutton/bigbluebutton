package org.bigbluebutton.core

import akka.actor.Props
import org.bigbluebutton.core.running.BaseMeetingActor

object MockTestActor {
  def props(): Props = Props(classOf[MockTestActor])
}

class MockTestActor extends BaseMeetingActor {

  def receive = {
    case _ => log.error("Shouldn't receive anything as this is just an actor stand in.")
  }
}
