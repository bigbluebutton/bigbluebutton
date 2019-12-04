package org.bigbluebutton.common2.redis

import akka.actor.ActorSystem
import io.lettuce.core.ClientOptions
import io.lettuce.core.RedisClient
import io.lettuce.core.RedisURI

abstract class RedisClientProvider(
    val system:      ActorSystem,
    val clientName:  String,
    val redisConfig: RedisConfig
) {
  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  val redisPassword = redisConfig.password match {
    case Some(pass) => pass
    case None       => ""
  }

  val redisUri = RedisURI.Builder.redis(redisConfig.host, redisConfig.port).withClientName(clientName).withPassword(redisPassword).build()

  var redis = RedisClient.create(redisUri)
  redis.setOptions(ClientOptions.builder().autoReconnect(true).build())
}
