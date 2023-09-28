package org.bigbluebutton.common2.redis

import org.apache.pekko.actor.ActorSystem

abstract class RedisStorageProvider(system: ActorSystem, clientName: String, config: RedisConfig) {
  val redisPass = config.password match {
    case Some(pass) => pass
    case None       => ""
  }

  var redis = new RedisStorageService()
  redis.setHost(config.host)
  redis.setPort(config.port)
  redis.setPassword(redisPass)
  redis.setExpireKey(config.expireKey)
  redis.setClientName(clientName)
  redis.start()
}
