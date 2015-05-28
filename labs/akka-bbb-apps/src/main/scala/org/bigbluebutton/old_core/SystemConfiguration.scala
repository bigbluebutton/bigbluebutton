package org.bigbluebutton.core

import com.typesafe.config.ConfigFactory
import scala.util.Try

trait SystemConfiguration {

  val config = ConfigFactory.load()

  lazy val serviceHost = Try(config.getString("service.host")).getOrElse("127.0.0.1")

  lazy val servicePort = Try(config.getInt("service.port")).getOrElse(8080)

  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")

  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)

  lazy val apiSourceName = Try(config.getString("api.source")).getOrElse("bigbluebutton-apps")
  lazy val apiChannel = Try(config.getString("api.channel")).getOrElse("bbb-apps-channel")
}