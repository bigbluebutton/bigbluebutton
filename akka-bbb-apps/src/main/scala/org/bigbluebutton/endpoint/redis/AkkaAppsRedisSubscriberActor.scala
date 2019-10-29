package org.bigbluebutton.endpoint.redis

import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.{ RedisConfig, RedisSubscriberProvider }
import akka.actor.ActorSystem
import akka.actor.Props

object AppsRedisSubscriberActor {
  def props(
      system:              ActorSystem,
      jsonMsgBus:          IncomingJsonMessageBus,
      redisConfig:         RedisConfig,
      channelsToSubscribe: Seq[String],
      patternsToSubscribe: Seq[String],
      forwardMsgToChannel: String
  ): Props =
    Props(
      classOf[AppsRedisSubscriberActor],
      system,
      jsonMsgBus,
      redisConfig,
      channelsToSubscribe,
      patternsToSubscribe,
      forwardMsgToChannel
    ).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(
    system:              ActorSystem,
    jsonMsgBus:          IncomingJsonMessageBus,
    redisConfig:         RedisConfig,
    channelsToSubscribe: Seq[String],
    patternsToSubscribe: Seq[String],
    forwardMsgToChannel: String
)
  extends RedisSubscriberProvider(
    system,
    "BbbAppsAkkaSub",
    channelsToSubscribe,
    patternsToSubscribe,
    jsonMsgBus,
    redisConfig
  ) {

  addListener(forwardMsgToChannel)
  subscribe()
}
