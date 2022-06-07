package org.bigbluebutton.core.running

import akka.actor.{ Actor, ActorLogging }

// A marker trait so we can create testable meeting actors
trait BaseMeetingActor extends Actor with ActorLogging {

}
