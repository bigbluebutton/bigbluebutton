package org.bigbluebutton.client.endpoint.redis

import akka.actor.{ActorLogging, OneForOneStrategy, Props}
import akka.actor.SupervisorStrategy.Resume
import java.io.{PrintWriter, StringWriter}
import java.net.InetSocketAddress

import redis.actors.RedisSubscriberActor
import redis.api.pubsub.{Message, PMessage}

import scala.concurrent.duration._
import org.bigbluebutton.client._
import org.bigbluebutton.client.bus.{JsonMsgFromAkkaApps, JsonMsgFromAkkaAppsBus, JsonMsgFromAkkaAppsEvent}
import redis.api.servers.ClientSetname

object AppsRedisSubscriberActor extends SystemConfiguration {

  val channels = Seq(fromAkkaAppsRedisChannel, fromAkkaAppsWbRedisChannel, fromAkkaAppsChatRedisChannel, fromAkkaAppsPresRedisChannel, fromThirdPartyRedisChannel)
  val patterns = Seq("bigbluebutton:from-bbb-apps:*")

  def props(jsonMsgBus: JsonMsgFromAkkaAppsBus): Props =
    Props(classOf[AppsRedisSubscriberActor], jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(jsonMsgBus: JsonMsgFromAkkaAppsBus, redisHost: String,
                               redisPort: Int,
                               channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
    extends RedisSubscriberActor(new InetSocketAddress(redisHost, redisPort),
      channels, patterns, onConnectStatus = connected => { println(s"connected: $connected") })
      with SystemConfiguration with ActorLogging {

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
  write(ClientSetname("Red5AppsSub").encodedRequest)

  def onMessage(message: Message) {
    if (channels.contains(message.channel)) {
      //log.debug(s"RECEIVED:\n ${message.data.utf8String} \n")
      val receivedJsonMessage = new JsonMsgFromAkkaApps(message.channel, message.data.utf8String)
      jsonMsgBus.publish(JsonMsgFromAkkaAppsEvent(fromAkkaAppsJsonChannel, receivedJsonMessage))
    }

  }

  def onPMessage(pmessage: PMessage) {
    // We don't use PSubscribe anymore, but an implementation of the method is required
    log.error("Should not be receiving a PMessage. It triggered on a match of pattern: " + pmessage.patternMatched)
  }
}
