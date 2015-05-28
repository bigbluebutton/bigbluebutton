package org.bigbluebutton.endpoint.redis

import akka.actor.Props
import java.net.InetSocketAddress
import redis.actors.RedisSubscriberActor
import redis.api.pubsub.{ PMessage, Message }
import scala.concurrent.duration._
import akka.actor.ActorRef
import akka.actor.actorRef2Scala
import org.bigbluebutton.SystemConfiguration

object AppsRedisSubscriberActor extends SystemConfiguration {

  val channels = Seq("time")
  val patterns = Seq("pattern.*")

  def props(): Props =
    Props(classOf[AppsRedisSubscriberActor],
      redisHost, redisPort,
      channels, patterns).withDispatcher("akka.rediscala-client-worker-dispatcher")
}

class AppsRedisSubscriberActor(redisHost: String,
  redisPort: Int,
  channels: Seq[String] = Nil, patterns: Seq[String] = Nil)
    extends RedisSubscriberActor(
      new InetSocketAddress(redisHost, redisPort),
      channels, patterns) {

  def onMessage(message: Message) {
    log.debug(s"message received: $message")
  }

  def onPMessage(pmessage: PMessage) {
    log.debug(s"pattern message received: $pmessage")
  }

  def handleMessage(msg: String) {
    log.warning("**** TODO: Handle pubsub messages. ****")
  }
}