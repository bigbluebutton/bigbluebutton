package org.bigbluebutton.common2.redis

class MessageSender(publisher: RedisPublisher) {

  def send(channel: String, data: String) {
    publisher.publish(channel, data)
  }
}
