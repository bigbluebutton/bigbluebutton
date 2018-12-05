package org.bigbluebutton.common2.redis

import akka.actor.ActorSystem

class RedisPublisher(system: ActorSystem, clientName: String) extends RedisClientProvider(system, clientName) {
  val connection = redis.connectPubSub()

  redis.connect()

  def publish(channel: String, data: String) {
    val async = connection.async();
    async.publish(channel, data);
  }

}
