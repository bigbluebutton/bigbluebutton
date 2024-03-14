package org.bigbluebutton.core.running

import org.apache.pekko.actor.{ Actor, ActorLogging }

// A marker trait so we can create testable meeting actors
trait BaseMeetingActor extends Actor with ActorLogging {

}
