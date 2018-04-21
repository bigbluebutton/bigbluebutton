package org.bigbluebutton.client

import akka.actor.ActorSystem
import akka.event.Logging
import org.bigbluebutton.client.bus._
import org.bigbluebutton.client.endpoint.redis.{ AppsRedisSubscriberActor, MessageSender, RedisPublisher }
import org.bigbluebutton.client.meeting.MeetingManagerActor

import scala.concurrent.duration._

class ClientGWApplication(system: ActorSystem, val msgToClientGW: MsgToClientGW, connEventBus: FromConnEventBus) extends SystemConfiguration {

  implicit val timeout = akka.util.Timeout(3 seconds)

  val log = Logging(system, getClass)

  log.debug("*********** meetingManagerChannel = " + meetingManagerChannel)

  private val msgFromClientEventBus = new MsgFromClientEventBus
  //private val jsonMsgToAkkaAppsBus = new JsonMsgToAkkaAppsBus
  private val redisPublisher = new RedisPublisher(system)
  private val msgSender: MessageSender = new MessageSender(redisPublisher)

  private val messageSenderActorRef = system.actorOf(MessageSenderActor.props(msgSender), "messageSenderActor")

  connEventBus.subscribe(messageSenderActorRef, toAkkaAppsJsonChannel)

  private val meetingManagerActorRef = system.actorOf(MeetingManagerActor.props(connEventBus), "meetingManagerActor")
  connEventBus.subscribe(meetingManagerActorRef, fromAkkaAppsChannel)

  msgFromClientEventBus.subscribe(meetingManagerActorRef, fromClientChannel)

  private val msgToAkkaAppsToJsonActor = system.actorOf(MsgToAkkaAppsToJsonActor.props(connEventBus), "msgToAkkaAppsToJsonActor")

  connEventBus.subscribe(msgToAkkaAppsToJsonActor, toAkkaAppsChannel)

  private val msgToClientJsonActor = system.actorOf(MsgToClientJsonActor.props(msgToClientGW), "msgToClientJsonActor")

  connEventBus.subscribe(msgToClientJsonActor, toClientChannel)

  private val appsRedisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(connEventBus), "appsRedisSubscriberActor")

  private val receivedJsonMsgHdlrActor = system.actorOf(ReceivedJsonMsgHdlrActor.props(connEventBus), "receivedJsonMsgHdlrActor")

  connEventBus.subscribe(receivedJsonMsgHdlrActor, fromAkkaAppsJsonChannel)

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

  def send(channel: String, json: String): Unit = {
    //log.debug("Sending message {}", json)
    connEventBus.publish(MsgFromConnBusMsg(toAkkaAppsJsonChannel, new JsonMsgToAkkaApps(channel, json)))
  }

  def shutdown(): Unit = {
    system.terminate()
  }

}
