package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{ Future, Await }
import scala.concurrent.ExecutionContext.Implicits.global
import org.bigbluebutton.endpoint.redis.AppsRedisPublisherActor
import org.bigbluebutton.endpoint.redis.AppsRedisSubscriberActor

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")

  val redisPublisherActor = system.actorOf(
    AppsRedisPublisherActor.props(system),
    "redis-publisher")

  val redisSubscriberActor = system.actorOf(
    AppsRedisSubscriberActor.props(),
    "redis-subscriber")
}