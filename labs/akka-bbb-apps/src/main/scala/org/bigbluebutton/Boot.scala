package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{ Future, Await }
import scala.concurrent.ExecutionContext.Implicits.global
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
import org.bigbluebutton.core.recorders.ChatEventRedisRecorder
import org.bigbluebutton.core.recorders.PresentationEventRedisRecorder
import org.bigbluebutton.core.recorders.UsersEventRedisRecorder
import org.bigbluebutton.core.recorders.WhiteboardEventRedisRecorder

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")

  val redisPublisher = new RedisPublisher(system)
  val msgSender = new MessageSender(redisPublisher)

  val redisDispatcher = new RedisDispatcher(redisHost, redisPort, redisPassword)
  val recorderApp = new RecorderApplication(redisDispatcher)
  recorderApp.start()

  val voiceEventRecorder = new VoiceEventRecorder(recorderApp)

  val chatEventRecorder = new ChatEventRedisRecorder(recorderApp)
  val presentationEventRecorder = new PresentationEventRedisRecorder(recorderApp)
  val usersEventRecorder = new UsersEventRedisRecorder(recorderApp)
  val whiteboardEventRecorder = new WhiteboardEventRedisRecorder(recorderApp)

  val chatSender = new ChatEventRedisPublisher(msgSender)
  val meetingSender = new MeetingEventRedisPublisher(msgSender)
  val presSender = new PresentationEventRedisPublisher(msgSender)
  val userSender = new UsersEventRedisPublisher(msgSender)
  val whiteboardSender = new WhiteboardEventRedisPublisher(msgSender)

  val outMessageListeners = new java.util.ArrayList[OutMessageListener2]()
  outMessageListeners.add(chatSender)
  outMessageListeners.add(meetingSender)
  outMessageListeners.add(presSender)
  outMessageListeners.add(userSender)
  outMessageListeners.add(whiteboardSender)
  outMessageListeners.add(chatEventRecorder)
  outMessageListeners.add(presentationEventRecorder)
  outMessageListeners.add(usersEventRecorder)
  outMessageListeners.add(whiteboardEventRecorder)

  val outGW = new MessageOutGateway(outMessageListeners)
  val bbbInGW = new BigBlueButtonInGW(system, outGW, voiceEventRecorder)
  val redisMsgReceiver = new RedisMessageReceiver(bbbInGW)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(redisMsgReceiver), "redis-subscriber")

  val keepAliveRedisPublisher = new KeepAliveRedisPublisher(system, redisPublisher)
}