package org.bigbluebutton

import scala.util.Try
import com.typesafe.config.ConfigFactory

trait SystemConfiguration {
  val config = ConfigFactory.load()

  // Redis server configuration
  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")
  lazy val redisExpireKey = Try(config.getInt("redis.keyExpiry")).getOrElse(1209600)

  lazy val eslHost = Try(config.getString("freeswitch.esl.host")).getOrElse("127.0.0.1")
  lazy val eslPort = Try(config.getInt("freeswitch.esl.port")).getOrElse(8021)
  lazy val eslPassword = Try(config.getString("freeswitch.esl.password")).getOrElse("ClueCon")
  lazy val fsProfile = Try(config.getString("freeswitch.conf.profile")).getOrElse("cdquality")

  lazy val toFsAppsJsonChannel = Try(config.getString("eventBus.toFsAppsChannel")).getOrElse("to-fs-apps-json-channel")
  lazy val fromFsAppsJsonChannel = Try(config.getString("eventBus.fromFsAppsChannel")).getOrElse("from-fs-apps-json-channel")
  lazy val toVoiceConfRedisChannel = Try(config.getString("redis.toVoiceConfRedisChannel")).getOrElse("to-voice-conf-redis-channel")
  lazy val fromVoiceConfRedisChannel = Try(config.getString("redis.fromVoiceConfRedisChannel")).getOrElse("from-voice-conf-redis-channel")

  // Grab the "interface" parameter from the http config
  val httpHost = config.getString("http.interface")
  // Grab the "port" parameter from the http config
  val httpPort = config.getInt("http.port")
}
