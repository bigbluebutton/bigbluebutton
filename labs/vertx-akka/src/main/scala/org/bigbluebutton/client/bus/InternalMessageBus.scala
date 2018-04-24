package org.bigbluebutton.client.bus

import akka.actor.ActorRef
import akka.event.{ EventBus, LookupClassification }
import org.bigbluebutton.client.bus.ConnInfo2
import org.bigbluebutton.common2.msgs.BbbCommonEnvJsNodeMsg

case class ConnInfo2(meetingId: String, userId: String, token: String, connId: String)

sealed trait FromConnMsg
case class ConnectionCreated(connInfo: ConnInfo2) extends FromConnMsg
case class ConnectionDestroyed(connInfo: ConnInfo2) extends FromConnMsg
case class MsgToConnMsg(json: String) extends FromConnMsg
case class MsgFromConnMsg(connInfo: ConnInfo2, json: String) extends FromConnMsg
case class JsonMsgFromAkkaApps(name: String, data: String) extends FromConnMsg
case class JsonMsgToAkkaApps(channel: String, json: String) extends FromConnMsg
case class MsgFromAkkaApps(payload: BbbCommonEnvJsNodeMsg) extends FromConnMsg
case class MsgToAkkaApps(payload: BbbCommonEnvJsNodeMsg) extends FromConnMsg
case class BroadcastMsgToMeeting(meetingId: String, data: BbbCommonEnvJsNodeMsg) extends FromConnMsg
case class DirectMsgToClient(meetingId: String, connId: String, data: BbbCommonEnvJsNodeMsg) extends FromConnMsg
case class DisconnectClientMsg(meetingId: String, connId: String) extends FromConnMsg
case class DisconnectAllMeetingClientsMsg(meetingId: String) extends FromConnMsg
case class ClientConnectedMsg(connInfo: ConnInfo2) extends FromConnMsg
case class ClientDisconnectedMsg(connInfo: ConnInfo2) extends FromConnMsg
case class MsgFromClientMsg(connInfo: ConnInfo2, json: String) extends FromConnMsg

case class MsgFromConnBusMsg(val topic: String, val payload: FromConnMsg)

class InternalMessageBus extends EventBus with LookupClassification {
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
