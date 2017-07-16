package org.bigbluebutton

import akka.event.Logging
import akka.actor.ActorSystem
import org.bigbluebutton.endpoint.redis.{ AppsRedisSubscriberActor, KeepAliveRedisPublisher, RedisPublisher, RedisRecorderActor }
import org.bigbluebutton.core.BigBlueButtonInGW
import org.bigbluebutton.core.MessageSender
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.MessageSenderActor
import org.bigbluebutton.core.pubsub.receivers.RedisMessageReceiver
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.pubsub.senders.ReceivedJsonMsgHandlerActor
import org.bigbluebutton.core2.FromAkkaAppsMsgSenderActor

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")
  implicit val executor = system.dispatcher
  val logger = Logging(system, getClass)

  val eventBus = new IncomingEventBus
  val outgoingEventBus = new OutgoingEventBus
  val outBus2 = new OutEventBus2
  val recordingEventBus = new RecordingEventBus
  val outGW = new OutMessageGateway(outgoingEventBus, outBus2, recordingEventBus)

  val redisPublisher = new RedisPublisher(system)
  val msgSender = new MessageSender(redisPublisher)

  val redisRecorderActor = system.actorOf(RedisRecorderActor.props(system), "redisRecorderActor")

  val messageSenderActor = system.actorOf(MessageSenderActor.props(msgSender), "messageSenderActor")

  outgoingEventBus.subscribe(messageSenderActor, outMessageChannel)

  outgoingEventBus.subscribe(redisRecorderActor, outMessageChannel)
  val incomingJsonMessageBus = new IncomingJsonMessageBus

  val bbbMsgBus = new BbbMsgRouterEventBus

  val fromAkkaAppsMsgSenderActorRef = system.actorOf(FromAkkaAppsMsgSenderActor.props(msgSender))
  outBus2.subscribe(fromAkkaAppsMsgSenderActorRef, outBbbMsgMsgChannel)
  outBus2.subscribe(redisRecorderActor, recordServiceMessageChannel)

  val bbbInGW = new BigBlueButtonInGW(system, eventBus, bbbMsgBus, outGW)
  val redisMsgReceiver = new RedisMessageReceiver(bbbInGW)

  val redisMessageHandlerActor = system.actorOf(ReceivedJsonMsgHandlerActor.props(bbbMsgBus, incomingJsonMessageBus))
  incomingJsonMessageBus.subscribe(redisMessageHandlerActor, toAkkaAppsJsonChannel)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(redisMsgReceiver, incomingJsonMessageBus), "redis-subscriber")

  val keepAliveRedisPublisher = new KeepAliveRedisPublisher(system, redisPublisher)
}
