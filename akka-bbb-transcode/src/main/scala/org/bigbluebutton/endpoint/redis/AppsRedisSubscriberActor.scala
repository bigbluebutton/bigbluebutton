package org.bigbluebutton.endpoint.redis

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.{ RedisSubscriber, RedisSubscriberProvider }

import akka.actor.ActorSystem
import akka.actor.Props

object AppsRedisSubscriberActor extends RedisSubscriber {

  val channels = Seq(toAkkaTranscodeRedisChannel)
  val patterns = Seq("bigbluebutton:to-bbb-transcode:*")

  def props(system: ActorSystem, jsonMsgBus: IncomingJsonMessageBus): Props =
    Props(
      classOf[AppsRedisSubscriberActor],
      system, jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(
  system: ActorSystem,
  msgBus: IncomingJsonMessageBus, redisHost: String,
  redisPort: Int,
  channels:  Seq[String] = Nil, patterns: Seq[String] = Nil)
  extends RedisSubscriberProvider(system, "BbbTranscodeAkkaSub", channels, patterns, msgBus) with SystemConfiguration {

  var lastPongReceivedOn = 0L
  system.scheduler.schedule(10 seconds, 10 seconds)(checkPongMessage())

  def checkPongMessage() {
    val now = System.currentTimeMillis()

    if (lastPongReceivedOn != 0 && (now - lastPongReceivedOn > 30000)) {
      log.error("BBB-Transcode pubsub error!");
    }
  }

  addListener(toAkkaTranscodeJsonChannel)
  subscribe()
}
