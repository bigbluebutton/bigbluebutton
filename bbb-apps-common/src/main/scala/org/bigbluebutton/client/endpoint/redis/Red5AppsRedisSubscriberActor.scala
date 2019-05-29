package org.bigbluebutton.client.endpoint.redis

import org.bigbluebutton.common2.redis.{ RedisConfig, RedisSubscriberProvider }
import io.lettuce.core.pubsub.RedisPubSubListener
import org.bigbluebutton.common2.bus.{ IncomingJsonMessageBus, JsonMsgFromAkkaApps, JsonMsgFromAkkaAppsBus, JsonMsgFromAkkaAppsEvent }
import akka.actor.ActorSystem
import akka.actor.Props

object Red5AppsRedisSubscriberActor {

  def props(
      system:              ActorSystem,
      jsonMsgBus:          JsonMsgFromAkkaAppsBus,
      incomingJsonMsgBus:  IncomingJsonMessageBus,
      redisConfig:         RedisConfig,
      channelsToSubscribe: Seq[String],
      patternsToSubscribe: Seq[String],
      forwardMsgToChannel: String
  ): Props =
    Props(
      classOf[Red5AppsRedisSubscriberActor],
      system,
      jsonMsgBus,
      incomingJsonMsgBus,
      redisConfig,
      channelsToSubscribe,
      patternsToSubscribe,
      forwardMsgToChannel
    ).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class Red5AppsRedisSubscriberActor(
    system:              ActorSystem,
    jsonMsgBus:          JsonMsgFromAkkaAppsBus,
    incomingJsonMsgBus:  IncomingJsonMessageBus, // Not used. Just to satisfy RedisSubscriberProvider (ralam april 4, 2019)
    redisConfig:         RedisConfig,
    channelsToSubscribe: Seq[String],
    patternsToSubscribe: Seq[String],
    forwardMsgToChannel: String
)
  extends RedisSubscriberProvider(
    system,
    "Red5AppsSub",
    channelsToSubscribe,
    patternsToSubscribe,
    incomingJsonMsgBus, // Not used. Just to satisfy RedisSubscriberProvider (ralam april 4, 2019)
    redisConfig
  ) {

  override def addListener(forwardMsgToChannel: String) {
    connection.addListener(new RedisPubSubListener[String, String] {
      def message(channel: String, message: String): Unit = {
        if (channelsToSubscribe.contains(channel)) {
          val receivedJsonMessage = new JsonMsgFromAkkaApps(channel, message)
          jsonMsgBus.publish(JsonMsgFromAkkaAppsEvent(forwardMsgToChannel, receivedJsonMessage))
        }
      }
      def message(pattern: String, channel: String, message: String): Unit = { log.info("Subscribed to channel {} with pattern {}", channel, pattern) }
      def psubscribed(pattern: String, count: Long): Unit = { log.info("Subscribed to pattern {}", pattern) }
      def punsubscribed(pattern: String, count: Long): Unit = { log.info("Unsubscribed from pattern {}", pattern) }
      def subscribed(channel: String, count: Long): Unit = { log.info("Subscribed to pattern {}", channel) }
      def unsubscribed(channel: String, count: Long): Unit = { log.info("Unsubscribed from channel {}", channel) }
    })
  }

  addListener(forwardMsgToChannel)
  subscribe()
}
