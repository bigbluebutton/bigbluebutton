package org.bigbluebutton.client

import scala.util.Try
import com.typesafe.config.ConfigFactory

trait SystemConfiguration {
  val config = ConfigFactory.load()

  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")

  lazy val toAkkaAppsRedisChannel = Try(config.getString("redis.toAkkaAppsRedisChannel")).getOrElse("to-akka-apps-redis-channel")
  lazy val fromAkkaAppsRedisChannel = Try(config.getString("redis.fromAkkaAppsRedisChannel")).getOrElse("from-akka-apps-redis-channel")
  lazy val toThirdPartyRedisChannel = Try(config.getString("redis.toThirdPartyRedisChannel")).getOrElse("to-third-party-redis-channel")
  lazy val fromThirdPartyRedisChannel = Try(config.getString("redis.fromThirdPartyRedisChannel")).getOrElse("from-third-party-redis-channel")
  lazy val meetingManagerChannel = Try(config.getString("eventBus.meetingManagerChannel")).getOrElse("FOOOOOOOOO")
  lazy val fromAkkaAppsChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-channel")
  lazy val toRedisChannel = Try(config.getString("eventBus.toRedisChannel")).getOrElse("to-redis-channel")
  lazy val fromClientChannel = Try(config.getString("eventBus.fromClientChannel")).getOrElse("from-client-channel")
  lazy val toClientChannel = Try(config.getString("eventBus.toClientChannel")).getOrElse("to-client-channel")
  lazy val fromAkkaAppsJsonChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-json-channel")

  lazy val fromAkkaAppsWbRedisChannel = Try(config.getString("redis.fromAkkaAppsWbRedisChannel")).getOrElse("from-akka-apps-wb-redis-channel")
  lazy val fromAkkaAppsChatRedisChannel = Try(config.getString("redis.fromAkkaAppsChatRedisChannel")).getOrElse("from-akka-apps-chat-redis-channel")
  lazy val fromAkkaAppsPresRedisChannel = Try(config.getString("redis.fromAkkaAppsPresRedisChannel")).getOrElse("from-akka-apps-pres-redis-channel")
}
