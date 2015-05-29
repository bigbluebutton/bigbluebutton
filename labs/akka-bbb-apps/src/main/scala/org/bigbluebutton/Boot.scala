package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{ Future, Await }
import scala.concurrent.ExecutionContext.Implicits.global
import org.bigbluebutton.endpoint.redis.AppsRedisPublisherActor
import org.bigbluebutton.endpoint.redis.AppsRedisSubscriberActor
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.IBigBlueButtonInGW
import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.BigBlueButtonInGW
import org.bigbluebutton.core.pubsub.receivers.RedisMessageReceiver

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")

  val outGW = new MessageOutGateway()
  val bbbGW = new BigBlueButtonGateway(system, outGW)

  val bbbInGW = new BigBlueButtonInGW(bbbGW)

  val redisMsgReceiver = new RedisMessageReceiver(bbbInGW)

  val redisPublisherActor = system.actorOf(
    AppsRedisPublisherActor.props(system), "redis-publisher")

  val redisSubscriberActor = system.actorOf(
    AppsRedisSubscriberActor.props(redisMsgReceiver), "redis-subscriber")
}