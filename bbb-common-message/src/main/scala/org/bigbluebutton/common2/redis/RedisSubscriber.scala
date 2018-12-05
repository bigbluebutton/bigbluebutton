package org.bigbluebutton.common2.redis

trait RedisSubscriber extends RedisConfiguration {
  val channels: Seq[String]
  val patterns: Seq[String]
}
