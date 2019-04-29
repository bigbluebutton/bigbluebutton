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

  /**
   * override def addListener(forwardMsgToChannel: String) {
   * connection.addListener(new RedisPubSubListener[String, String] {
   * def message(channel: String, message: String): Unit = {
   * println("**** RECEIVED MESSASGE FROm CHANNLE " + channel)
   * if (channelsToSubscribe.contains(channel)) {
   * val receivedJsonMessage = new ReceivedJsonMessage(channel, message)
   * jsonMsgBus.publish(IncomingJsonMessage(forwardMsgToChannel, receivedJsonMessage))
   * }
   * }
   * def message(pattern: String, channel: String, message: String): Unit = {
   * log.debug(s"RECEIVED:\n ${message} \n")
   * }
   * def psubscribed(pattern: String, count: Long): Unit = { log.info("Subscribed to pattern {}", pattern) }
   * def punsubscribed(pattern: String, count: Long): Unit = { log.info("Unsubscribed from pattern {}", pattern) }
   * def subscribed(channel: String, count: Long): Unit = { log.info("Subscribed to pattern {}", channel) }
   * def unsubscribed(channel: String, count: Long): Unit = { log.info("Unsubscribed from channel {}", channel) }
   * })
   * }
   */
  addListener(forwardMsgToChannel)
  subscribe()
}
