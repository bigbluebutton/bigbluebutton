package org.bigbluebutton.core.bus

import org.apache.pekko.actor.ActorRef
import org.bigbluebutton.core.api.InMessage

case class BigBlueButtonEvent(val topic: String, val payload: InMessage)

trait InternalEventBus {

  def publish(event: BigBlueButtonEvent): Unit
  def subscribe(actorRef: ActorRef, topic: String)
  def unsubscribe(actorRef: ActorRef, topic: String)
}

