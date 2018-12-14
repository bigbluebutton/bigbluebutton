package org.bigbluebutton.common2.redis

import scala.util.Try
import com.typesafe.config.ConfigFactory

trait RedisConfiguration {
  val config = ConfigFactory.load()

  // Redis server configuration
  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")
  lazy val redisExpireKey = Try(config.getInt("redis.keyExpiry")).getOrElse(1209600)

  // Redis channels
  lazy val toAkkaAppsRedisChannel = Try(config.getString("redis.toAkkaAppsRedisChannel")).getOrElse("to-akka-apps-redis-channel")
  lazy val fromAkkaAppsRedisChannel = Try(config.getString("redis.fromAkkaAppsRedisChannel")).getOrElse("from-akka-apps-redis-channel")

  lazy val toVoiceConfRedisChannel = Try(config.getString("redis.toVoiceConfRedisChannel")).getOrElse("to-voice-conf-redis-channel")
  lazy val fromVoiceConfRedisChannel = Try(config.getString("redis.fromVoiceConfRedisChannel")).getOrElse("from-voice-conf-redis-channel")

  lazy val fromAkkaAppsWbRedisChannel = Try(config.getString("redis.fromAkkaAppsWbRedisChannel")).getOrElse("from-akka-apps-wb-redis-channel")
  lazy val fromAkkaAppsChatRedisChannel = Try(config.getString("redis.fromAkkaAppsChatRedisChannel")).getOrElse("from-akka-apps-chat-redis-channel")
  lazy val fromAkkaAppsPresRedisChannel = Try(config.getString("redis.fromAkkaAppsPresRedisChannel")).getOrElse("from-akka-apps-pres-redis-channel")

  lazy val fromBbbWebRedisChannel = Try(config.getString("redis.fromBbbWebRedisChannel")).getOrElse("from-bbb-web-redis-channel")
}
