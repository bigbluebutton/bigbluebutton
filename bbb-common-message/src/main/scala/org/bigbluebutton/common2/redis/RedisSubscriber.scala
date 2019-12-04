package org.bigbluebutton.common2.redis

trait RedisSubscriber {
  val channelsToSubscribe: Seq[String]
  val patternsToSubscribe: Seq[String]
}
