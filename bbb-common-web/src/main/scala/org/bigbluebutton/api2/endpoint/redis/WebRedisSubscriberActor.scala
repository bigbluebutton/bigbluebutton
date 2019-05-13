package org.bigbluebutton.api2.endpoint.redis

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.bus._
import org.bigbluebutton.common2.redis.{ RedisConfig, RedisSubscriberProvider }
import akka.actor.ActorSystem
import akka.actor.Props

import io.lettuce.core.pubsub.RedisPubSubListener

object WebRedisSubscriberActor {

  def props(
      system:              ActorSystem,
      jsonMsgBus:          JsonMsgFromAkkaAppsBus,
      oldMessageEventBus:  OldMessageEventBus,
      incomingJsonMsgBus:  IncomingJsonMessageBus,
      redisConfig:         RedisConfig,
      channelsToSubscribe: Seq[String],
      patternsToSubscribe: Seq[String],
      forwardMsgToChannel: String,
      oldJsonChannel:      String
  ): Props =
    Props(
      classOf[WebRedisSubscriberActor],
      system,
      jsonMsgBus,
      oldMessageEventBus,
      incomingJsonMsgBus,
      redisConfig,
      channelsToSubscribe,
      patternsToSubscribe,
      forwardMsgToChannel,
      oldJsonChannel
    ).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class WebRedisSubscriberActor(
    system:              ActorSystem,
    jsonMsgBus:          JsonMsgFromAkkaAppsBus,
    oldMessageEventBus:  OldMessageEventBus,
    incomingJsonMsgBus:  IncomingJsonMessageBus, // Not used. Just to satisfy RedisSubscriberProvider (ralam april 4, 2019)
    redisConfig:         RedisConfig,
    channelsToSubscribe: Seq[String],
    patternsToSubscribe: Seq[String],
    forwardMsgToChannel: String,
    oldJsonChannel:      String
) extends RedisSubscriberProvider(
  system,
  "BbbWebSub",
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
      def message(pattern: String, channel: String, message: String): Unit = {
        log.debug(s"RECEIVED:\n ${message} \n")
        val receivedJsonMessage = new OldReceivedJsonMessage(pattern, channel, message)
        oldMessageEventBus.publish(OldIncomingJsonMessage(oldJsonChannel, receivedJsonMessage))
      }
      def psubscribed(pattern: String, count: Long): Unit = { log.info("Subscribed to pattern {}", pattern) }
      def punsubscribed(pattern: String, count: Long): Unit = { log.info("Unsubscribed from pattern {}", pattern) }
      def subscribed(channel: String, count: Long): Unit = { log.info("Subscribed to pattern {}", channel) }
      def unsubscribed(channel: String, count: Long): Unit = { log.info("Unsubscribed from channel {}", channel) }
    })
  }

  addListener(forwardMsgToChannel)
  subscribe()
}
