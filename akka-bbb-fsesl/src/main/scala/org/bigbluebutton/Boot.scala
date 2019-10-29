package org.bigbluebutton

import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.common2.redis.{ RedisConfig, RedisPublisher }
import org.bigbluebutton.endpoint.redis.FSESLRedisSubscriberActor
import org.bigbluebutton.freeswitch.{ RxJsonMsgHdlrActor, VoiceConferenceService }
import org.bigbluebutton.freeswitch.voice.FreeswitchConferenceEventListener
import org.bigbluebutton.freeswitch.voice.freeswitch.{ ConnectionManager, ESLEventListener, FreeswitchApplication }
import org.freeswitch.esl.client.manager.DefaultManagerConnection
import akka.actor.ActorSystem

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-fsesl-system")

  val redisPass = if (redisPassword != "") Some(redisPassword) else None
  val redisConfig = RedisConfig(redisHost, redisPort, redisPass, redisExpireKey)

  val redisPublisher = new RedisPublisher(
    system,
    "BbbFsEslAkkaPub",
    redisConfig
  )

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

  val channelsToSubscribe = Seq(toVoiceConfRedisChannel)

  val redisSubscriberActor = system.actorOf(
    FSESLRedisSubscriberActor.props(
      system,
      inJsonMsgBus,
      redisConfig,
      channelsToSubscribe,
      Nil,
      toFsAppsJsonChannel
    ),
    "redis-subscriber"
  )
}
