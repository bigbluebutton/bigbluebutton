package org.bigbluebutton.common2.redis

class MessageSender(publisher: RedisPublisher) {

  def send(channel: String, data: String): Unit = {
    publisher.publish(channel, data)
  }
}
