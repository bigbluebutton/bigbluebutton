package org.bigbluebutton.core

import org.bigbluebutton.endpoint.redis.RedisPublisher

class MessageSender(publisher: RedisPublisher) {

  def send(channel: String, data: String) {
    publisher.publish(channel, data)
  }
}