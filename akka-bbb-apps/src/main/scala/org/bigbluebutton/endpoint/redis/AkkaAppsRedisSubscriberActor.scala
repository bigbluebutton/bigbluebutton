package org.bigbluebutton.endpoint.redis

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.{ RedisSubscriber, RedisSubscriberProvider }

import akka.actor.ActorSystem
import akka.actor.Props

object AppsRedisSubscriberActor extends RedisSubscriber {

  val channels = Seq(toAkkaAppsRedisChannel, fromVoiceConfRedisChannel)
  val patterns = Seq("bigbluebutton:to-bbb-apps:*", "bigbluebutton:from-voice-conf:*", "bigbluebutton:from-bbb-transcode:*")

  def props(system: ActorSystem, jsonMsgBus: IncomingJsonMessageBus): Props =
    Props(
      classOf[AppsRedisSubscriberActor],
      system, jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class AppsRedisSubscriberActor(
  system:     ActorSystem,
  jsonMsgBus: IncomingJsonMessageBus,
  redisHost:  String, redisPort: Int,
  channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
  extends RedisSubscriberProvider(system, "BbbAppsAkkaSub", channels, patterns, jsonMsgBus) with SystemConfiguration {

  addListener(toAkkaAppsJsonChannel)
  subscribe()
}
