package org.bigbluebutton.client

import scala.util.Try

import org.bigbluebutton.common2.redis.RedisConfiguration

trait SystemConfiguration extends RedisConfiguration {
  lazy val toThirdPartyRedisChannel = Try(config.getString("redis.toThirdPartyRedisChannel")).getOrElse("to-third-party-redis-channel")
  lazy val fromThirdPartyRedisChannel = Try(config.getString("redis.fromThirdPartyRedisChannel")).getOrElse("from-third-party-redis-channel")
  lazy val fromAkkaAppsChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-channel")
  lazy val toRedisChannel = Try(config.getString("eventBus.toRedisChannel")).getOrElse("to-redis-channel")
  lazy val fromClientChannel = Try(config.getString("eventBus.fromClientChannel")).getOrElse("from-client-channel")
  lazy val toClientChannel = Try(config.getString("eventBus.toClientChannel")).getOrElse("to-client-channel")
  lazy val fromAkkaAppsJsonChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-json-channel")
}
