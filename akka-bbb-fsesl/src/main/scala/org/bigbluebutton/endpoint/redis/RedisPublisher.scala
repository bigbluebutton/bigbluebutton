package org.bigbluebutton.endpoint.redis

import redis.RedisClient
import akka.actor.ActorSystem
import org.bigbluebutton.SystemConfiguration

class RedisPublisher(val system: ActorSystem) extends SystemConfiguration {

  val redis = RedisClient(redisHost, redisPort)(system)

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  redis.clientSetname("BbbFsEslAkkaPub")

  def publish(channel: String, data: String) {
    //println("PUBLISH TO [" + channel + "]: \n [" + data + "]")
    redis.publish(channel, data)
  }

}
