package org.bigbluebutton.common2.redis

import akka.actor.Actor
import akka.event.LoggingAdapter
import redis.api.pubsub.PMessage

trait RedisAppSubscriberActor extends Actor {

  def log: LoggingAdapter

  def handleMessage(msg: String) {
    throw new UnsupportedOperationException();
  }

  def onPMessage(pmessage: PMessage) {
    throw new UnsupportedOperationException();
  }
}
