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
import org.bigbluebutton.core.pubsub.receivers.RedisMessageReceiver
import redis.api.servers.ClientSetname

object AppsRedisSubscriberActor extends SystemConfiguration {

  val TO_AKKA_APPS = "bbb:to-akka-apps"
  val channels = Seq("time", TO_AKKA_APPS)
  val patterns = Seq("bigbluebutton:to-bbb-apps:*", "bigbluebutton:from-voice-conf:*")

  def props(msgReceiver: RedisMessageReceiver, jsonMsgBus: IncomingJsonMessageBus): Props =
    Props(classOf[AppsRedisSubscriberActor], msgReceiver, jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(msgReceiver: RedisMessageReceiver, jsonMsgBus: IncomingJsonMessageBus, redisHost: String,
  redisPort: Int,
  channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
    extends RedisSubscriberActor(new InetSocketAddress(redisHost, redisPort),
      channels, patterns, onConnectStatus = connected => { println(s"connected: $connected") }) {

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on AppsRedisSubscriberActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  val TO_AKKA_APPS = "bbb:to-akka-apps"

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  write(ClientSetname("BbbAppsAkkaSub").encodedRequest)

  def onMessage(message: Message) {
    //log.error(s"SHOULD NOT BE RECEIVING: $message")
    if (message.channel == TO_AKKA_APPS) {
      val receivedJsonMessage = new ReceivedJsonMessage(message.channel, message.data.utf8String)
      println(receivedJsonMessage.data)
      jsonMsgBus.publish(IncomingJsonMessage("incoming-json-message", receivedJsonMessage))
    }
  }

  def onPMessage(pmessage: PMessage) {
    log.debug(s"RECEIVED:\n ${pmessage.data.utf8String} \n")

    msgReceiver.handleMessage(pmessage.patternMatched, pmessage.channel, pmessage.data.utf8String)
  }
}
