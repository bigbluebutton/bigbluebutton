package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{ Future, Await }
import scala.concurrent.ExecutionContext.Implicits.global
import org.bigbluebutton.endpoint.redis.{ RedisPublisher, AppsRedisSubscriberActor }
import org.bigbluebutton.transcode.pubsub.receivers.RedisMessageReceiver
import org.bigbluebutton.transcode.core.TranscodingInGW

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-transcode-system")

  val redisPublisher = new RedisPublisher(system)

  var transcodingInGW = new TranscodingInGW(system, redisPublisher);

  val redisMsgReceiver = new RedisMessageReceiver(transcodingInGW);

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(system, redisMsgReceiver), "redis-subscriber")
}
