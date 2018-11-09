package org.bigbluebutton.endpoint.redis

import java.net.InetSocketAddress

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.bus.IncomingJsonMessage
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.bus.ReceivedJsonMessage
import org.bigbluebutton.common2.redis.RedisAppSubscriberActor
import org.bigbluebutton.common2.redis.RedisConfiguration
import org.bigbluebutton.common2.redis.RedisSubscriber

import akka.actor.Props
import redis.actors.RedisSubscriberActor
import redis.api.pubsub.Message
import redis.api.servers.ClientSetname
import java.io.StringWriter
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import scala.concurrent.duration.DurationInt
import java.io.PrintWriter

object AppsRedisSubscriberActor extends RedisSubscriber with RedisConfiguration {

  val channels = Seq(toAkkaAppsRedisChannel, fromVoiceConfRedisChannel)
  val patterns = Seq("bigbluebutton:to-bbb-apps:*", "bigbluebutton:from-voice-conf:*", "bigbluebutton:from-bbb-transcode:*")

  def props(jsonMsgBus: IncomingJsonMessageBus): Props =
    Props(classOf[AppsRedisSubscriberActor], jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(jsonMsgBus: IncomingJsonMessageBus, redisHost: String,
                               redisPort: Int,
                               channels:  Seq[String] = Nil, patterns: Seq[String] = Nil)
  extends RedisSubscriberActor(
    new InetSocketAddress(redisHost, redisPort),
    channels, patterns, onConnectStatus = connected => { println(s"connected: $connected") })
  with SystemConfiguration
  with RedisAppSubscriberActor {

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on AppsRedisSubscriberActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  write(ClientSetname("BbbAppsAkkaSub").encodedRequest)

  def onMessage(message: Message) {
    if (message.channel == toAkkaAppsRedisChannel || message.channel == fromVoiceConfRedisChannel) {
      val receivedJsonMessage = new ReceivedJsonMessage(message.channel, message.data.utf8String)
      //log.debug(s"RECEIVED:\n [${receivedJsonMessage.channel}] \n ${receivedJsonMessage.data} \n")
      jsonMsgBus.publish(IncomingJsonMessage(toAkkaAppsJsonChannel, receivedJsonMessage))
    }
  }

}
