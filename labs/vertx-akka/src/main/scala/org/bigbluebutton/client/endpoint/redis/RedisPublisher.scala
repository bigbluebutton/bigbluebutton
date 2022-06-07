package org.bigbluebutton.client.endpoint.redis

import redis.RedisClient
import akka.actor.ActorSystem
import akka.event.Logging
import org.bigbluebutton.client.SystemConfiguration
import akka.util.ByteString

class RedisPublisher(val system: ActorSystem) extends SystemConfiguration {

  val redis = RedisClient(redisHost, redisPort)(system)

  val log = Logging(system, getClass)

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  redis.clientSetname("Red5AppsPub")

  def publish(channel: String, data: String) {
    //log.debug("PUBLISH TO [" + channel + "]: \n [" + data + "]")
    redis.publish(channel, ByteString(data))
  }

}
