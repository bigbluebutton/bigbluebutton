package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{ Future, Await }
import scala.concurrent.ExecutionContext.Implicits.global
//import org.bigbluebutton.apps.MeetingManager
import org.bigbluebutton.endpoint.redis.AppsRedisPublisherActor

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")

  val redisPublisherActor = system.actorOf(
    AppsRedisPublisherActor.props(system),
    "redis-publisher")

  //  val meetingManager = system.actorOf(MeetingManager.props(redisPublisherActor), "meeting-manager")

}