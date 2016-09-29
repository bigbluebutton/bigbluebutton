package org.bigbluebutton

import com.typesafe.config.ConfigFactory
import scala.util.Try

trait SystemConfiguration {

  val config = ConfigFactory.load()

  lazy val eslHost = Try(config.getString("freeswitch.esl.host")).getOrElse("127.0.0.1")
  lazy val eslPort = Try(config.getInt("freeswitch.esl.port")).getOrElse(8021)
  lazy val eslPassword = Try(config.getString("freeswitch.esl.password")).getOrElse("ClueCon")
  lazy val fsProfile = Try(config.getString("freeswitch.conf.profile")).getOrElse("cdquality")

  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")

}