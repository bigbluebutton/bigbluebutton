package org.bigbluebutton.api2.endpoint.redis

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.bus._
import org.bigbluebutton.common2.redis.{ RedisConfiguration, RedisSubscriber, RedisSubscriberProvider }

import akka.actor.ActorSystem
import akka.actor.Props
import io.lettuce.core.pubsub.RedisPubSubListener

object WebRedisSubscriberActor extends RedisSubscriber with RedisConfiguration {

  val channels = Seq(fromAkkaAppsRedisChannel)
  val patterns = Seq("bigbluebutton:from-bbb-apps:*")

  def props(system: ActorSystem, jsonMsgBus: JsonMsgFromAkkaAppsBus, oldMessageEventBus: OldMessageEventBus): Props =
    Props(
      classOf[WebRedisSubscriberActor],
      system, jsonMsgBus, oldMessageEventBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class WebRedisSubscriberActor(
  system:     ActorSystem,
  jsonMsgBus: JsonMsgFromAkkaAppsBus, oldMessageEventBus: OldMessageEventBus, redisHost: String,
  redisPort: Int,
  channels:  Seq[String] = Nil, patterns: Seq[String] = Nil)
  extends RedisSubscriberProvider(system, "BbbWebSub", channels, patterns, null) with SystemConfiguration {

  override def addListener(appChannel: String) {
    connection.addListener(new RedisPubSubListener[String, String] {
      def message(channel: String, message: String): Unit = {
        if (channels.contains(channel)) {
          val receivedJsonMessage = new JsonMsgFromAkkaApps(channel, message)
          jsonMsgBus.publish(JsonMsgFromAkkaAppsEvent(fromAkkaAppsJsonChannel, receivedJsonMessage))
        }
      }
      def message(pattern: String, channel: String, message: String): Unit = {
        log.debug(s"RECEIVED:\n ${message} \n")
        val receivedJsonMessage = new OldReceivedJsonMessage(pattern, channel, message)
        oldMessageEventBus.publish(OldIncomingJsonMessage(fromAkkaAppsOldJsonChannel, receivedJsonMessage))
      }
      def psubscribed(pattern: String, count: Long): Unit = { log.info("Subscribed to pattern {}", pattern) }
      def punsubscribed(pattern: String, count: Long): Unit = { log.info("Unsubscribed from pattern {}", pattern) }
      def subscribed(channel: String, count: Long): Unit = { log.info("Subscribed to pattern {}", channel) }
      def unsubscribed(channel: String, count: Long): Unit = { log.info("Unsubscribed from channel {}", channel) }
    })
  }

  addListener(fromAkkaAppsJsonChannel)
  subscribe()
}
