package org.bigbluebutton

import akka.actor.ActorSystem

import org.bigbluebutton.endpoint.redis.{ RedisPublisher, AppsRedisSubscriberActor }
import org.bigbluebutton.transcode.JsonMsgHdlrActor
import org.bigbluebutton.transcode.core.TranscodingInGW
import org.bigbluebutton.transcode.bus.InJsonMsgBus

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-transcode-system")

  val redisPublisher = new RedisPublisher(system)

  var inGW = new TranscodingInGW(system, redisPublisher)

  val inJsonMsgBus = new InJsonMsgBus
  val redisMessageHandlerActor = system.actorOf(JsonMsgHdlrActor.props(inGW))
  inJsonMsgBus.subscribe(redisMessageHandlerActor, toAkkaTranscodeJsonChannel)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(system, inJsonMsgBus), "redis-subscriber")
}
