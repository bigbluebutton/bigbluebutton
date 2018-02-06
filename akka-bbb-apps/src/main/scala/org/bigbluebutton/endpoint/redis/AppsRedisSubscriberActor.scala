package org.bigbluebutton.endpoint.redis

import akka.actor.Props
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import java.io.{ PrintWriter, StringWriter }
import java.net.InetSocketAddress

import redis.actors.RedisSubscriberActor
import redis.api.pubsub.{ Message, PMessage }

import scala.concurrent.duration._
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.bus.{ IncomingJsonMessage, IncomingJsonMessageBus, ReceivedJsonMessage }
import redis.api.servers.ClientSetname

object AppsRedisSubscriberActor extends SystemConfiguration {

  val TO_AKKA_APPS = "bbb:to-akka-apps"
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
      channels, patterns, onConnectStatus = connected => { println(s"connected: $connected") }
    ) with SystemConfiguration {

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

  def onPMessage(pmessage: PMessage) {

    // We don't use PSubscribe anymore, but an implementation of the method is required
    //log.error("Should not be receiving a PMessage. It triggered on a match of pattern: " + pmessage.patternMatched)
    //log.error(pmessage.data.utf8String)
  }
}
