package org.bigbluebutton

import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.RedisPublisher
import org.bigbluebutton.endpoint.redis.AppsRedisSubscriberActor
import org.bigbluebutton.transcode.JsonMsgHdlrActor
import org.bigbluebutton.common2.redis.RedisConfig
import akka.actor.ActorSystem
import org.bigbluebutton.common2.redis.MessageSender
import org.bigbluebutton.transcode.core.TranscodingInGW

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-transcode-system")

  val redisPass = if (redisPassword != "") Some(redisPassword) else None
  val redisConfig = RedisConfig(redisHost, redisPort, redisPass, redisExpireKey)

  val redisPublisher = new RedisPublisher(
    system,
    "BbbTranscodeAkkaPub",
    redisConfig
  )

  val msgSender = new MessageSender(redisPublisher)

  var inGW = new TranscodingInGW(system, msgSender)

  val inJsonMsgBus = new IncomingJsonMessageBus
  val redisMessageHandlerActor = system.actorOf(JsonMsgHdlrActor.props(inGW))
  inJsonMsgBus.subscribe(redisMessageHandlerActor, toAkkaTranscodeJsonChannel)

  val channelsToSubscribe = Seq(toAkkaTranscodeRedisChannel)

  val redisSubscriberActor = system.actorOf(
    AppsRedisSubscriberActor.props(
      system,
      inJsonMsgBus,
      redisConfig,
      channelsToSubscribe,
      Nil,
      toAkkaTranscodeJsonChannel
    ),
    "redis-subscriber"
  )
}
