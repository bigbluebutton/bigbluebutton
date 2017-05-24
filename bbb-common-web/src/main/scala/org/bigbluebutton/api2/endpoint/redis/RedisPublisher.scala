package org.bigbluebutton.api2.endpoint.redis

import akka.actor.ActorSystem
import akka.util.ByteString
import org.bigbluebutton.api2.SystemConfiguration
import redis.RedisClient

class RedisPublisher(val system: ActorSystem) extends SystemConfiguration {

  val redis = RedisClient(redisHost, redisPort)(system)

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  redis.clientSetname("BbbWebPub")

  def publish(channel: String, data: String) {
    println("PUBLISH TO \n[" + channel + "]: \n " + data + "\n")
    redis.publish(channel, ByteString(data))
  }

}
