package org.bigbluebutton.common2.redis

import akka.actor.ActorSystem
import akka.event.Logging
import akka.util.ByteString
import redis.RedisClient

class RedisPublisher(val system: ActorSystem, val clientName: String) extends RedisConfiguration {

  val redis = RedisClient(redisHost, redisPort)(system)

  val log = Logging(system, getClass)

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  redis.clientSetname(clientName)

  def publish(channel: String, data: String) {
    redis.publish(channel, ByteString(data))
  }

}
