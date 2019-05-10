package org.bigbluebutton.app.screenshare.redis

import org.bigbluebutton.common2.bus._
import org.bigbluebutton.common2.redis.{ RedisConfig, RedisSubscriberProvider }
import akka.actor.ActorSystem
import akka.actor.Props
import io.lettuce.core.pubsub.RedisPubSubListener

object ScreenshareRedisSubscriberActor {

  def props(
    system: ActorSystem,
    jsonMsgBus: IncomingJsonMessageBus,
    redisConfig: RedisConfig,
    channelsToSubscribe: Seq[String],
    patternsToSubscribe: Seq[String],
    forwardMsgToChannel: String): Props =
    Props(
      classOf[ScreenshareRedisSubscriberActor],
      system,
      jsonMsgBus,
      redisConfig,
      channelsToSubscribe,
      patternsToSubscribe,
      forwardMsgToChannel).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class ScreenshareRedisSubscriberActor(
  system: ActorSystem,
  jsonMsgBus: IncomingJsonMessageBus,
  redisConfig: RedisConfig,
  channelsToSubscribe: Seq[String],
  patternsToSubscribe: Seq[String],
  forwardMsgToChannel: String)
  extends RedisSubscriberProvider(
    system,
    "BbbScreenshareAkkaSub",
    channelsToSubscribe,
    patternsToSubscribe,
    jsonMsgBus,
    redisConfig) {

  addListener(forwardMsgToChannel)
  subscribe()
}
