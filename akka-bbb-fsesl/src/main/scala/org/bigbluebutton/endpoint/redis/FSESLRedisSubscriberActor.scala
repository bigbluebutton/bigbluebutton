package org.bigbluebutton.endpoint.redis

import java.io.PrintWriter
import java.io.StringWriter
import java.net.InetSocketAddress

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.redis.RedisAppSubscriberActor
import org.bigbluebutton.common2.redis.RedisConfiguration
import org.bigbluebutton.common2.redis.RedisSubscriber
import org.bigbluebutton.freeswitch.bus.InJsonMsg
import org.bigbluebutton.freeswitch.bus.InsonMsgBus
import org.bigbluebutton.freeswitch.bus.ReceivedJsonMsg

import akka.actor.ActorSystem
import akka.actor.OneForOneStrategy
import akka.actor.Props
import akka.actor.SupervisorStrategy.Resume
import redis.actors.RedisSubscriberActor
import redis.api.pubsub.Message
import redis.api.servers.ClientSetname

object FSESLRedisSubscriberActor extends RedisSubscriber with RedisConfiguration {

  val channels = Seq(toVoiceConfRedisChannel)
  val patterns = Seq("bigbluebutton:to-voice-conf:*", "bigbluebutton:from-bbb-apps:*")

  def props(system: ActorSystem, inJsonMgBus: InsonMsgBus): Props =
    Props(classOf[FSESLRedisSubscriberActor], system, inJsonMgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-subscriber-worker-dispatcher")
}

class FSESLRedisSubscriberActor(
  val system:  ActorSystem,
  inJsonMgBus: InsonMsgBus, redisHost: String,
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
      sw.write("An exception has been thrown on FSESlRedisSubscriberActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }
  var lastPongReceivedOn = 0L
  system.scheduler.schedule(10 seconds, 10 seconds)(checkPongMessage())

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  write(ClientSetname("BbbFsEslAkkaSub").encodedRequest)

  def checkPongMessage() {
    val now = System.currentTimeMillis()

    if (lastPongReceivedOn != 0 && (now - lastPongReceivedOn > 30000)) {
      log.error("FSESL pubsub error!");
    }
  }

  def onMessage(message: Message) {
    if (message.channel == toVoiceConfRedisChannel) {
      val receivedJsonMessage = new ReceivedJsonMsg(message.channel, message.data.utf8String)
      log.debug(s"RECEIVED:\n [${receivedJsonMessage.channel}] \n ${receivedJsonMessage.data} \n")
      inJsonMgBus.publish(InJsonMsg(toFsAppsJsonChannel, receivedJsonMessage))
    }
  }
}
