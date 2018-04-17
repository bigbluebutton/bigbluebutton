package org.bigbluebutton.client.bus

import akka.actor.ActorRef
import akka.event.{ EventBus, LookupClassification }
import org.bigbluebutton.client.ConnInfo

case class ConnInfo2(id: String)

sealed trait FromConnMsg
case class ConnectMsg2(connInfo: ConnInfo2) extends FromConnMsg
case class DisconnectMsg2(connInfo: ConnInfo2) extends FromConnMsg
case class MsgToConnMsg(connInfo: ConnInfo2, json: String) extends FromConnMsg
case class MsgFromConnMsg(connInfo: ConnInfo2, json: String) extends FromConnMsg
case class MsgFromConnBusMsg(val topic: String, val payload: FromConnMsg)

class FromConnEventBus extends EventBus with LookupClassification {
  type Event = MsgFromConnBusMsg
  type Classifier = String
  type Subscriber = ActorRef

  // is used for extracting the classifier from the incoming events
  override protected def classify(event: Event): Classifier = event.topic

  // will be invoked for each event for all subscribers which registered themselves
  // for the event’s classifier
  override protected def publish(event: Event, subscriber: Subscriber): Unit = {
    subscriber ! event.payload
  }

  // must define a full order over the subscribers, expressed as expected from
  // `java.lang.Comparable.compare`
  override protected def compareSubscribers(a: Subscriber, b: Subscriber): Int =
    a.compareTo(b)

  // determines the initial size of the index data structure
  // used internally (i.e. the expected number of different classifiers)
  override protected def mapSize: Int = 128
}
