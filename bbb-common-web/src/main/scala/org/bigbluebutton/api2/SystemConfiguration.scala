package org.bigbluebutton.api2

import com.typesafe.config.ConfigFactory

import scala.util.Try

trait SystemConfiguration {
  val config = ConfigFactory.load("bbb-web")

  lazy val toAkkaAppsRedisChannel = Try(config.getString("redis.toAkkaAppsRedisChannel")).getOrElse("to-akka-apps-redis-channel")
  lazy val fromAkkaAppsRedisChannel = Try(config.getString("redis.fromAkkaAppsRedisChannel")).getOrElse("from-akka-apps-redis-channel")

  lazy val fromBbbWebRedisChannel = Try(config.getString("redis.fromBbbWebRedisChannel")).getOrElse("from-bbb-web-redis-channel")

  lazy val fromAkkaAppsChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-channel")
  lazy val toAkkaAppsChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-channel")
  lazy val fromClientChannel = Try(config.getString("eventBus.fromClientChannel")).getOrElse("from-client-channel")
  lazy val toClientChannel = Try(config.getString("eventBus.toClientChannel")).getOrElse("to-client-channel")
  lazy val toAkkaAppsJsonChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-json-channel")
  lazy val fromAkkaAppsJsonChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-json-channel")
  lazy val fromAkkaAppsOldJsonChannel = Try(config.getString("eventBus.fromAkkaAppsOldChannel")).getOrElse("from-akka-apps-old-json-channel")
}
