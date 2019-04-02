package org.bigbluebutton.common2.redis

import akka.actor.ActorSystem

abstract class RedisStorageProvider(system: ActorSystem, clientName: String) extends RedisConfiguration {
  var redis = new RedisStorageService()
  redis.setHost(redisHost)
  redis.setPort(redisPort)
  redis.setPassword(redisPassword)
  redis.setExpireKey(redisExpireKey)
  redis.setClientName(clientName)
  redis.start();
}
