package org.bigbluebutton.app.screenshare

import scala.util.Try
import com.typesafe.config.ConfigFactory

trait SystemConfiguration {

  //val config = ConfigFactory.load("screenshare-app")
  val config = ConfigFactory.load()

  lazy val meetingManagerChannel = Try(config.getString("eventBus.meetingManagerChannel")).getOrElse("NOT FROM APP CONF")


  lazy val toScreenshareAppsJsonChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-screenshare-apps-json-channel")
  lazy val fromAkkaAppsRedisChannel = Try(config.getString("redis.fromAkkaAppsRedisChannel")).getOrElse("from-akka-apps-redis-channel")
}
