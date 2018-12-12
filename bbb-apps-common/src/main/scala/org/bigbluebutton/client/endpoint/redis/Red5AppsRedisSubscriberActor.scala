package org.bigbluebutton.client.endpoint.redis

import org.bigbluebutton.common2.redis.RedisSubscriberProvider
import io.lettuce.core.pubsub.RedisPubSubListener
import org.bigbluebutton.common2.bus.JsonMsgFromAkkaApps
import org.bigbluebutton.common2.redis.RedisConfiguration
import org.bigbluebutton.client.SystemConfiguration
import akka.actor.ActorSystem
import org.bigbluebutton.common2.redis.RedisSubscriber
import org.bigbluebutton.common2.bus.JsonMsgFromAkkaAppsBus
import akka.actor.Props
import org.bigbluebutton.common2.bus.JsonMsgFromAkkaAppsEvent

object Red5AppsRedisSubscriberActor extends RedisSubscriber with RedisConfiguration with SystemConfiguration {

  val channels = Seq(fromAkkaAppsRedisChannel, fromAkkaAppsWbRedisChannel, fromAkkaAppsChatRedisChannel, fromAkkaAppsPresRedisChannel, fromThirdPartyRedisChannel)
  val patterns = Seq("bigbluebutton:from-bbb-apps:*")

  def props(system: ActorSystem, jsonMsgBus: JsonMsgFromAkkaAppsBus): Props =
    Props(
      classOf[Red5AppsRedisSubscriberActor],
      system, jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class Red5AppsRedisSubscriberActor(system: ActorSystem, jsonMsgBus: JsonMsgFromAkkaAppsBus,
                                   redisHost: String, redisPort: Int,
                                   channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
  extends RedisSubscriberProvider(system, "Red5AppsSub", channels, patterns, null) with SystemConfiguration {

  override def addListener(appChannel: String) {
    connection.addListener(new RedisPubSubListener[String, String] {
      def message(channel: String, message: String): Unit = {
        if (channels.contains(channel)) {
          val receivedJsonMessage = new JsonMsgFromAkkaApps(channel, message)
          jsonMsgBus.publish(JsonMsgFromAkkaAppsEvent(fromAkkaAppsJsonChannel, receivedJsonMessage))
        }
      }
      def message(pattern: String, channel: String, message: String): Unit = { log.info("Subscribed to channel {} with pattern {}", channel, pattern) }
      def psubscribed(pattern: String, count: Long): Unit = { log.info("Subscribed to pattern {}", pattern) }
      def punsubscribed(pattern: String, count: Long): Unit = { log.info("Unsubscribed from pattern {}", pattern) }
      def subscribed(channel: String, count: Long): Unit = { log.info("Subscribed to pattern {}", channel) }
      def unsubscribed(channel: String, count: Long): Unit = { log.info("Unsubscribed from channel {}", channel) }
    })
  }

  addListener(null)
  subscribe()
}
