package org.bigbluebutton.bus

import akka.actor.ActorRef
import akka.event.{EventBus, LookupClassification}
import org.bigbluebutton.common2.msgs.BbbCommonEnvCoreMsg

case class MsgToAkkaApps(val topic: String, val payload: BbbCommonEnvCoreMsg)

class AkkaAppsEventBus extends EventBus with LookupClassification {
  override type Event = MsgToAkkaApps
  override type Classifier = String
  override type Subscriber = ActorRef

  override protected def classify(event: Event): Classifier = event.topic

  override protected def publish(event: Event, subscriber: Subscriber): Unit = {
    subscriber ! event.payload
  }

  override protected def compareSubscribers(a: Subscriber, b: Subscriber): Int = a.compareTo(b)

  override protected def mapSize(): Int = 128
}
