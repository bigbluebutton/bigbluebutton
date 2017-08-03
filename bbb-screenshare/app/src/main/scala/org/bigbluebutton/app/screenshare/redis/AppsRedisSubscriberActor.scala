package org.bigbluebutton.app.screenshare.redis

import java.io.{PrintWriter, StringWriter}
import java.net.InetSocketAddress

import akka.actor.{OneForOneStrategy, Props}
import akka.actor.SupervisorStrategy.Resume
import org.bigbluebutton.app.screenshare.SystemConfiguration
import redis.actors.RedisSubscriberActor
import redis.api.servers.ClientSetname
import redis.actors.RedisSubscriberActor
import redis.api.pubsub.{ Message, PMessage }
import scala.concurrent.duration._

object AppsRedisSubscriberActor extends SystemConfiguration{

  val channels = Seq(fromAkkaAppsRedisChannel)
  val patterns = Seq("bigbluebutton:to-bbb-apps:*", "bigbluebutton:from-voice-conf:*")

  def props(jsonMsgBus: IncomingJsonMessageBus): Props =
    Props(classOf[AppsRedisSubscriberActor], jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(jsonMsgBus: IncomingJsonMessageBus, redisHost: String,
  redisPort: Int,
  channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
    extends RedisSubscriberActor(new InetSocketAddress(redisHost, redisPort),
      channels, patterns, onConnectStatus = connected => { println(s"connected: $connected") }) with SystemConfiguration {

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
  write(ClientSetname("BbbScreenshareAkkaSub").encodedRequest)

  def onMessage(message: Message) {
    //log.error(s"SHOULD NOT BE RECEIVING: $message")
    if (message.channel == fromAkkaAppsRedisChannel) {
      val receivedJsonMessage = new ReceivedJsonMessage(message.channel, message.data.utf8String)
      //log.debug(s"RECEIVED:\n [${receivedJsonMessage.channel}] \n ${receivedJsonMessage.data} \n")
      jsonMsgBus.publish(IncomingJsonMessage(toScreenshareAppsJsonChannel, receivedJsonMessage))
    }
  }

  def onPMessage(pmessage: PMessage) {
    //log.debug(s"RECEIVED:\n ${pmessage.data.utf8String} \n")
  }
}
