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

}
