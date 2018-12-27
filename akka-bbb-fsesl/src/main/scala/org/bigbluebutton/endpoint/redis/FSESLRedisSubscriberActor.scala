package org.bigbluebutton.endpoint.redis

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.{ RedisSubscriber, RedisSubscriberProvider }

import akka.actor.ActorSystem
import akka.actor.Props

object FSESLRedisSubscriberActor extends RedisSubscriber {

  val channels = Seq(toVoiceConfRedisChannel)
  val patterns = Seq("bigbluebutton:to-voice-conf:*", "bigbluebutton:from-bbb-apps:*")

  def props(system: ActorSystem, inJsonMgBus: IncomingJsonMessageBus): Props =
    Props(
      classOf[FSESLRedisSubscriberActor],
      system, inJsonMgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class FSESLRedisSubscriberActor(
  system:      ActorSystem,
  inJsonMgBus: IncomingJsonMessageBus,
  redisHost:   String, redisPort: Int,
  channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
  extends RedisSubscriberProvider(system, "BbbFsEslAkkaSub", channels, patterns, inJsonMgBus) with SystemConfiguration {

  var lastPongReceivedOn = 0L
  system.scheduler.schedule(10 seconds, 10 seconds)(checkPongMessage())

  def checkPongMessage() {
    val now = System.currentTimeMillis()

    if (lastPongReceivedOn != 0 && (now - lastPongReceivedOn > 30000)) {
      log.error("FSESL pubsub error!");
    }
  }

  addListener(toFsAppsJsonChannel)
  subscribe()
}