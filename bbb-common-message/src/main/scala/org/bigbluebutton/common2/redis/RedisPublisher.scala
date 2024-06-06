package org.bigbluebutton.common2.redis

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.event.Logging

class RedisPublisher(
    system:      ActorSystem,
    clientName:  String,
    redisConfig: RedisConfig
)
  extends RedisClientProvider(
    system,
    clientName,
    redisConfig
  ) with RedisConnectionHandler {

  val log = Logging(system, getClass)

  subscribeToEventBus(redis, log)

  val connection = redis.connectPubSub()

  redis.connect()

  def publish(channel: String, data: String) {
    val async = connection.async()
    async.publish(channel, data)
  }

}
