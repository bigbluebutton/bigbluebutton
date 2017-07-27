package org.bigbluebutton.endpoint.redis

import java.io.PrintWriter
import java.io.StringWriter
import java.net.InetSocketAddress

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt

import akka.actor.ActorSystem
import akka.actor.OneForOneStrategy
import akka.actor.Props
import akka.actor.SupervisorStrategy.Resume

import redis.actors.RedisSubscriberActor
import redis.api.pubsub.Message
import redis.api.pubsub.PMessage
import redis.api.servers.ClientSetname

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.transcode.bus.{ InJsonMsg, InJsonMsgBus, ReceivedJsonMsg }

object AppsRedisSubscriberActor extends SystemConfiguration {

  val channels = Seq(toAkkaTranscodeRedisChannel)
  val patterns = Seq("bigbluebutton:to-bbb-transcode:*")

  def props(system: ActorSystem, msgBus: InJsonMsgBus): Props =
    Props(classOf[AppsRedisSubscriberActor], system, msgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(val system: ActorSystem,
  msgBus: InJsonMsgBus, redisHost: String,
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

  var lastPongReceivedOn = 0L
  system.scheduler.schedule(10 seconds, 10 seconds)(checkPongMessage())

  write(ClientSetname("BbbTranscodeAkkaSub").encodedRequest)

  def checkPongMessage() {
    val now = System.currentTimeMillis()

    if (lastPongReceivedOn != 0 && (now - lastPongReceivedOn > 30000)) {
      log.error("BBB-Transcode pubsub error!");
    }
  }

  def onMessage(message: Message) {
    if (message.channel == toAkkaTranscodeRedisChannel) {
      val receivedJsonMessage = new ReceivedJsonMsg(message.channel, message.data.utf8String)
      log.debug(s"RECEIVED:\n [${receivedJsonMessage.channel}] \n ${receivedJsonMessage.data} \n")
      msgBus.publish(InJsonMsg(toAkkaTranscodeJsonChannel, receivedJsonMessage))
    }
  }

  def onPMessage(pmessage: PMessage) {
    //    log.debug(s"pattern message received: $pmessage")
  }

  def handleMessage(msg: String) {
    log.warning("**** TODO: Handle pubsub messages. ****")
  }
}
