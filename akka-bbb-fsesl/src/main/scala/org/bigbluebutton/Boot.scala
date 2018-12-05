package org.bigbluebutton

import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.RedisPublisher
import org.bigbluebutton.endpoint.redis.FSESLRedisSubscriberActor
import org.bigbluebutton.freeswitch.{ RxJsonMsgHdlrActor, VoiceConferenceService }
import org.bigbluebutton.freeswitch.voice.FreeswitchConferenceEventListener
import org.bigbluebutton.freeswitch.voice.freeswitch.{ ConnectionManager, ESLEventListener, FreeswitchApplication }
import org.freeswitch.esl.client.manager.DefaultManagerConnection

import akka.actor.ActorSystem

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-fsesl-system")

  val redisPublisher = new RedisPublisher(system, "BbbFsEslAkkaPub")

  val eslConnection = new DefaultManagerConnection(eslHost, eslPort, eslPassword)

  val voiceConfService = new VoiceConferenceService(redisPublisher)

  val fsConfEventListener = new FreeswitchConferenceEventListener(voiceConfService)
  fsConfEventListener.start()

  val eslEventListener = new ESLEventListener(fsConfEventListener)
  val connManager = new ConnectionManager(eslConnection, eslEventListener, fsConfEventListener)

  connManager.start()

  val fsApplication = new FreeswitchApplication(connManager, fsProfile)
  fsApplication.start()

  val inJsonMsgBus = new IncomingJsonMessageBus
  val redisMessageHandlerActor = system.actorOf(RxJsonMsgHdlrActor.props(fsApplication))
  inJsonMsgBus.subscribe(redisMessageHandlerActor, toFsAppsJsonChannel)

  val redisSubscriberActor = system.actorOf(FSESLRedisSubscriberActor.props(system, inJsonMsgBus), "redis-subscriber")
}
