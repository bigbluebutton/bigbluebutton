package org.bigbluebutton.app.screenshare.redis

import org.bigbluebutton.app.screenshare.SystemConfiguration
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.RedisSubscriberProvider

import akka.actor.ActorSystem
import akka.actor.Props

object ScreenshareRedisSubscriberActor extends SystemConfiguration {

  val channels = Seq(fromAkkaAppsRedisChannel)
  val patterns = Seq("bigbluebutton:to-bbb-apps:*", "bigbluebutton:from-voice-conf:*")

  def props(system: ActorSystem, jsonMsgBus: IncomingJsonMessageBus): Props =
    Props(
      classOf[ScreenshareRedisSubscriberActor],
      system, jsonMsgBus,
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.redis-subscriber-worker-dispatcher")
}

class ScreenshareRedisSubscriberActor(
  system: ActorSystem,
  jsonMsgBus: IncomingJsonMessageBus,
  redisHost: String, redisPort: Int,
  channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
  extends RedisSubscriberProvider(system, "BbbScreenshareAkkaSub", channels, patterns, jsonMsgBus) with SystemConfiguration {

  addListener(toScreenshareAppsJsonChannel)
  subscribe()
}
