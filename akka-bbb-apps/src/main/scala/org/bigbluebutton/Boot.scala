package org.bigbluebutton

import akka.http.scaladsl.Http
import akka.event.{ LoggingAdapter, Logging }
import akka.stream.{ ActorMaterializer, Materializer }
import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{ Future, Await }
import org.bigbluebutton.endpoint.redis.RedisPublisher
import org.bigbluebutton.endpoint.redis.KeepAliveRedisPublisher
import org.bigbluebutton.endpoint.redis.AppsRedisSubscriberActor
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.IBigBlueButtonInGW
import org.bigbluebutton.core.BigBlueButtonInGW
import org.bigbluebutton.core.MessageSender
import org.bigbluebutton.core.pubsub.receivers.RedisMessageReceiver
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.pubsub.senders._
import org.bigbluebutton.core.service.recorder.RedisDispatcher
import org.bigbluebutton.core.service.recorder.RecorderApplication
import org.bigbluebutton.core.recorders.VoiceEventRecorder

object Boot extends App with SystemConfiguration with Service {

  override implicit val system = ActorSystem("bigbluebutton-apps-system")
  override implicit val executor = system.dispatcher
  override implicit val materializer = ActorMaterializer()
  override val logger = Logging(system, getClass)

  val redisPublisher = new RedisPublisher(system)
  val msgSender = new MessageSender(redisPublisher)

  val redisDispatcher = new RedisDispatcher(redisHost, redisPort, redisPassword)
  val recorderApp = new RecorderApplication(redisDispatcher)
  recorderApp.start()

  val voiceEventRecorder = new VoiceEventRecorder(recorderApp)
  val bbbInGW = new BigBlueButtonInGW(system, recorderApp, msgSender, voiceEventRecorder)
  val redisMsgReceiver = new RedisMessageReceiver(bbbInGW)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(redisMsgReceiver), "redis-subscriber")

  val keepAliveRedisPublisher = new KeepAliveRedisPublisher(system, redisPublisher)

  Http().bindAndHandle(routes, httpInterface, httpPort)
}