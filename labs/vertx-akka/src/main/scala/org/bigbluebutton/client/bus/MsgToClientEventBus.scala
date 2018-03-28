package org.bigbluebutton.client.bus

import akka.actor.ActorRef
import akka.event.{ EventBus, LookupClassification }
import org.bigbluebutton.common2.msgs.BbbCommonEnvJsNodeMsg

sealed trait ToConnectionMsg
case class BroadcastMsgToMeeting(meetingId: String, data: BbbCommonEnvJsNodeMsg) extends ToConnectionMsg
case class DirectMsgToClient(meetingId: String, connId: String, data: BbbCommonEnvJsNodeMsg) extends ToConnectionMsg
case class DisconnectClientMsg(meetingId: String, connId: String) extends ToConnectionMsg
case class DisconnectAllMeetingClientsMsg(meetingId: String) extends ToConnectionMsg

case class MsgToClientBusMsg(val topic: String, payload: ToConnectionMsg)

class MsgToClientEventBus extends EventBus with LookupClassification {
  type Event = MsgToClientBusMsg
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
