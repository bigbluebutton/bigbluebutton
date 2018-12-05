package org.bigbluebutton.client

import akka.actor.ActorSystem
import akka.event.Logging
import org.bigbluebutton.client.bus._
import org.bigbluebutton.client.endpoint.redis.Red5AppsRedisSubscriberActor
import org.bigbluebutton.client.meeting.MeetingManagerActor
import org.bigbluebutton.common2.redis.RedisPublisher

import scala.concurrent.duration._
import org.bigbluebutton.common2.redis.MessageSender
import org.bigbluebutton.api2.bus.MsgFromAkkaAppsEventBus
import org.bigbluebutton.common2.bus.JsonMsgFromAkkaAppsBus

class ClientGWApplication(val msgToClientGW: MsgToClientGW) extends SystemConfiguration {

  implicit val system = ActorSystem("bbb-apps-common")
  implicit val timeout = akka.util.Timeout(3 seconds)

  val log = Logging(system, getClass)

  private val msgFromClientEventBus = new MsgFromClientEventBus
  private val msgFromAkkaAppsEventBus = new MsgFromAkkaAppsEventBus
  private val msgToRedisEventBus = new MsgToRedisEventBus
  private val msgToClientEventBus = new MsgToClientEventBus

  private val redisPublisher = new RedisPublisher(system, "Red5AppsPub")
  private val msgSender: MessageSender = new MessageSender(redisPublisher)

  private val meetingManagerActorRef = system.actorOf(
    MeetingManagerActor.props(msgToRedisEventBus, msgToClientEventBus), "meetingManagerActor")

  msgFromAkkaAppsEventBus.subscribe(meetingManagerActorRef, fromAkkaAppsChannel)
  msgFromClientEventBus.subscribe(meetingManagerActorRef, fromClientChannel)

  private val receivedJsonMsgBus = new JsonMsgFromAkkaAppsBus

  private val msgToRedisActor = system.actorOf(
    MsgToRedisActor.props(msgSender), "msgToRedisActor")

  msgToRedisEventBus.subscribe(msgToRedisActor, toRedisChannel)

  private val msgToClientJsonActor = system.actorOf(
    MsgToClientJsonActor.props(msgToClientGW), "msgToClientJsonActor")

  msgToClientEventBus.subscribe(msgToClientJsonActor, toClientChannel)

  private val appsRedisSubscriberActor = system.actorOf(Red5AppsRedisSubscriberActor.props(system, receivedJsonMsgBus), "appsRedisSubscriberActor")

  private val receivedJsonMsgHdlrActor = system.actorOf(
    ReceivedJsonMsgHdlrActor.props(msgFromAkkaAppsEventBus), "receivedJsonMsgHdlrActor")

  receivedJsonMsgBus.subscribe(receivedJsonMsgHdlrActor, fromAkkaAppsJsonChannel)

  /**
   *
   * External Interface for Gateway
   */

  def connect(connInfo: ConnInfo): Unit = {
    //log.debug("**** ClientGWApplication connect " + connInfo)
    msgFromClientEventBus.publish(MsgFromClientBusMsg(fromClientChannel, new ConnectMsg(connInfo)))
  }

  def disconnect(connInfo: ConnInfo): Unit = {
    //log.debug("**** ClientGWApplication disconnect " + connInfo)
    msgFromClientEventBus.publish(MsgFromClientBusMsg(fromClientChannel, new DisconnectMsg(connInfo)))
  }

  def handleMsgFromClient(connInfo: ConnInfo, json: String): Unit = {
    //log.debug("**** ClientGWApplication handleMsgFromClient " + json)
    msgFromClientEventBus.publish(MsgFromClientBusMsg(fromClientChannel, new MsgFromClientMsg(connInfo, json)))
  }

  def shutdown(): Unit = {
    system.terminate()
  }

}
