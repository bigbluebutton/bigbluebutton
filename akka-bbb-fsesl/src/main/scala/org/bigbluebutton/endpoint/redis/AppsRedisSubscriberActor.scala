package org.bigbluebutton.endpoint.redis

import akka.actor.Props
import java.net.InetSocketAddress
import redis.actors.RedisSubscriberActor
import redis.api.pubsub.{ PMessage, Message }
import scala.concurrent.duration._
import akka.actor.ActorRef
import akka.actor.actorRef2Scala
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.freeswitch.pubsub.receivers.RedisMessageReceiver
import redis.api.servers.ClientSetname
import org.bigbluebutton.common.converters.FromJsonDecoder
import org.bigbluebutton.common.messages.PubSubPongMessage
import akka.actor.ActorSystem
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

object AppsRedisSubscriberActor extends SystemConfiguration {

  val channels = Seq("time")
  val patterns = Seq("bigbluebutton:to-voice-conf:*", "bigbluebutton:from-bbb-apps:*")

  def props(system: ActorSystem, msgReceiver: RedisMessageReceiver): Props =
    Props(classOf[AppsRedisSubscriberActor], system, msgReceiver,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(val system: ActorSystem, msgReceiver: RedisMessageReceiver, redisHost: String,
  redisPort: Int, channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
    extends RedisSubscriberActor(new InetSocketAddress(redisHost, redisPort),
      channels, patterns) {

  val decoder = new FromJsonDecoder()

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
    log.debug(s"message received: $message")
  }

  def onPMessage(pmessage: PMessage) {
    //    log.debug(s"pattern message received: $pmessage")

    val msg = decoder.decodeMessage(pmessage.data)

    if (msg != null) {
      msg match {
        case m: PubSubPongMessage => {
          if (m.payload.system == "BbbFsESL") {
            lastPongReceivedOn = System.currentTimeMillis()
          }
        }
        case _ => // do nothing
      }
    } else {
      msgReceiver.handleMessage(pmessage.patternMatched, pmessage.channel, pmessage.data)
    }

  }

  def handleMessage(msg: String) {
    log.warning("**** TODO: Handle pubsub messages. ****")
  }
}
