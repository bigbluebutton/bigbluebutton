package org.bigbluebutton.common2.redis

abstract class RedisSubscriber extends RedisConfiguration {
  val channels: Seq[String]
  val patterns: Seq[String]
}
