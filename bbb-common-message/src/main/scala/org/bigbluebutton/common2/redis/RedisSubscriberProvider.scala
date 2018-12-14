package org.bigbluebutton.common2.redis

import akka.actor.ActorSystem
import org.bigbluebutton.common2.bus.ReceivedJsonMessage
import org.bigbluebutton.common2.bus.IncomingJsonMessage
import io.lettuce.core.pubsub.RedisPubSubListener
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import akka.actor.ActorLogging
import akka.actor.Actor

import akka.actor.ActorSystem
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import java.io.StringWriter
import scala.concurrent.duration._
import java.io.PrintWriter

abstract class RedisSubscriberProvider(system: ActorSystem, clientName: String,
                                       channels: Seq[String], patterns: Seq[String],
                                       jsonMsgBus: IncomingJsonMessageBus)
  extends RedisClientProvider(system, clientName) with RedisConnectionHandler with Actor with ActorLogging {

  subscribeToEventBus(redis, log)

  var connection = redis.connectPubSub()

  def addListener(appChannel: String) {
    connection.addListener(new RedisPubSubListener[String, String] {
      def message(channel: String, message: String): Unit = {
        if (channels.contains(channel)) {
          val receivedJsonMessage = new ReceivedJsonMessage(channel, message)
          jsonMsgBus.publish(IncomingJsonMessage(appChannel, receivedJsonMessage))
        }
      }
      def message(pattern: String, channel: String, message: String): Unit = { log.info("Subscribed to channel {} with pattern {}", channel, pattern) }
      def psubscribed(pattern: String, count: Long): Unit = { log.info("Subscribed to pattern {}", pattern) }
      def punsubscribed(pattern: String, count: Long): Unit = { log.info("Unsubscribed from pattern {}", pattern) }
      def subscribed(channel: String, count: Long): Unit = { log.info("Subscribed to pattern {}", channel) }
      def unsubscribed(channel: String, count: Long): Unit = { log.info("Unsubscribed from channel {}", channel) }
    })
  }

  def subscribe() {
    val async = connection.async()
    for (channel <- channels) async.subscribe(channel)
    for (pattern <- patterns) async.psubscribe(pattern)
  }

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on " + getClass + ", exception message [" + e.getMessage + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  def receive = {
    case _ => // do nothing
  }
}
