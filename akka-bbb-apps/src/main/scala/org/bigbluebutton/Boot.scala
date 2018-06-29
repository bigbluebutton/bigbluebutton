package org.bigbluebutton

import akka.event.Logging
import akka.actor.ActorSystem
import org.bigbluebutton.endpoint.redis.{ AppsRedisSubscriberActor, KeepAliveRedisPublisher, RedisPublisher, RedisRecorderActor }
import org.bigbluebutton.core._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.pubsub.senders.ReceivedJsonMsgHandlerActor
import org.bigbluebutton.core2.{ AnalyticsActor, FromAkkaAppsMsgSenderActor }

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")
  implicit val executor = system.dispatcher

  val logger = Logging(system, getClass)

  val eventBus = new InMsgBusGW(new IncomingEventBusImp())

  val outBus2 = new OutEventBus2
  val recordingEventBus = new RecordingEventBus

  val outGW = new OutMessageGatewayImp(outBus2)

  val redisPublisher = new RedisPublisher(system)
  val msgSender = new MessageSender(redisPublisher)

  val redisRecorderActor = system.actorOf(RedisRecorderActor.props(system), "redisRecorderActor")

  recordingEventBus.subscribe(redisRecorderActor, outMessageChannel)
  val incomingJsonMessageBus = new IncomingJsonMessageBus

  val bbbMsgBus = new BbbMsgRouterEventBus

  val fromAkkaAppsMsgSenderActorRef = system.actorOf(FromAkkaAppsMsgSenderActor.props(msgSender))
  val analyticsActorRef = system.actorOf(AnalyticsActor.props())
  outBus2.subscribe(fromAkkaAppsMsgSenderActorRef, outBbbMsgMsgChannel)
  outBus2.subscribe(redisRecorderActor, recordServiceMessageChannel)

  outBus2.subscribe(analyticsActorRef, outBbbMsgMsgChannel)
  bbbMsgBus.subscribe(analyticsActorRef, analyticsChannel)

  val bbbActor = system.actorOf(BigBlueButtonActor.props(system, eventBus, bbbMsgBus, outGW), "bigbluebutton-actor")
  eventBus.subscribe(bbbActor, meetingManagerChannel)

  val redisMessageHandlerActor = system.actorOf(ReceivedJsonMsgHandlerActor.props(bbbMsgBus, incomingJsonMessageBus))
  incomingJsonMessageBus.subscribe(redisMessageHandlerActor, toAkkaAppsJsonChannel)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(incomingJsonMessageBus), "redis-subscriber")

  val keepAliveRedisPublisher = new KeepAliveRedisPublisher(system, redisPublisher)

}
