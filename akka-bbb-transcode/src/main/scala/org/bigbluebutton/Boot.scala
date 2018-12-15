package org.bigbluebutton

import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.RedisPublisher
import org.bigbluebutton.endpoint.redis.AppsRedisSubscriberActor
import org.bigbluebutton.transcode.JsonMsgHdlrActor

import akka.actor.ActorSystem
import org.bigbluebutton.common2.redis.MessageSender
import org.bigbluebutton.transcode.core.TranscodingInGW

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-transcode-system")

  val redisPublisher = new RedisPublisher(system, "BbbTranscodeAkkaPub")
  val msgSender = new MessageSender(redisPublisher)

  var inGW = new TranscodingInGW(system, msgSender)

  val inJsonMsgBus = new IncomingJsonMessageBus
  val redisMessageHandlerActor = system.actorOf(JsonMsgHdlrActor.props(inGW))
  inJsonMsgBus.subscribe(redisMessageHandlerActor, toAkkaTranscodeJsonChannel)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(system, inJsonMsgBus), "redis-subscriber")
}
