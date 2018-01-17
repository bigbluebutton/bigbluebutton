package org.bigbluebutton.api2

import com.typesafe.config.ConfigFactory

import scala.util.Try

trait SystemConfiguration {
  val config = ConfigFactory.load("bbb-web")

  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")

  lazy val toAkkaAppsRedisChannel = Try(config.getString("redis.toAkkaAppsRedisChannel")).getOrElse("to-akka-apps-redis-channel")
  lazy val fromAkkaAppsRedisChannel = Try(config.getString("redis.fromAkkaAppsRedisChannel")).getOrElse("from-akka-apps-redis-channel")
  lazy val meetingManagerChannel = Try(config.getString("eventBus.meetingManagerChannel")).getOrElse("FOOOOOOOOO")
  lazy val fromAkkaAppsChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-channel")
  lazy val toAkkaAppsChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-channel")
  lazy val fromClientChannel = Try(config.getString("eventBus.fromClientChannel")).getOrElse("from-client-channel")
  lazy val toClientChannel = Try(config.getString("eventBus.toClientChannel")).getOrElse("to-client-channel")
  lazy val toAkkaAppsJsonChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-json-channel")
  lazy val fromAkkaAppsJsonChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-json-channel")
  lazy val fromAkkaAppsOldJsonChannel = Try(config.getString("eventBus.fromAkkaAppsOldChannel")).getOrElse("from-akka-apps-old-json-channel")
}
