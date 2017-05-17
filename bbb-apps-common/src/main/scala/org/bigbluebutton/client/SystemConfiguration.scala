package org.bigbluebutton.client

import scala.util.Try
import com.typesafe.config.ConfigFactory

trait SystemConfiguration {
  val config = ConfigFactory.load("bbb-app")

  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")

  lazy val redisSubChannel = Try(config.getString("redis.subChannel")).getOrElse("FROM-AKKA-APPS")
  lazy val meetingManagerChannel = Try(config.getString("eventBus.meetingManagerChannel")).getOrElse("FOOOOOOOOO")
  lazy val fromAkkaAppsChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-channel")
  lazy val toAkkaAppsChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-channel")
  lazy val fromClientChannel = Try(config.getString("eventBus.fromClientChannel")).getOrElse("from-client-channel")
  lazy val toClientChannel = Try(config.getString("eventBus.toClientChannel")).getOrElse("to-client-channel")
  lazy val toAkkaAppsJsonChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-akka-apps-json-channel")
  lazy val fromAkkaAppsJsonChannel = Try(config.getString("eventBus.fromAkkaAppsChannel")).getOrElse("from-akka-apps-json-channel")
  lazy val fromAkkaAppsOldJsonChannel = Try(config.getString("eventBus.fromAkkaAppsOldChannel")).getOrElse("from-akka-apps-old-json-channel")
}
