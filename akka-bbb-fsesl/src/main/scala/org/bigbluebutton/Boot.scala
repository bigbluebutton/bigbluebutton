package org.bigbluebutton

import akka.actor.{ ActorSystem }

import org.bigbluebutton.endpoint.redis.{ AppsRedisSubscriberActor, RedisPublisher }
import org.bigbluebutton.freeswitch.{ RxJsonMsgHdlrActor, VoiceConferenceService }
import org.bigbluebutton.freeswitch.bus.InsonMsgBus
import org.bigbluebutton.freeswitch.voice.FreeswitchConferenceEventListener
import org.bigbluebutton.freeswitch.voice.freeswitch.{ ConnectionManager, ESLEventListener, FreeswitchApplication }
import org.freeswitch.esl.client.manager.DefaultManagerConnection

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-fsesl-system")

  val redisPublisher = new RedisPublisher(system)

  val eslConnection = new DefaultManagerConnection(eslHost, eslPort, eslPassword)

  val voiceConfService = new VoiceConferenceService(redisPublisher)

  val fsConfEventListener = new FreeswitchConferenceEventListener(voiceConfService)
  fsConfEventListener.start()

  val eslEventListener = new ESLEventListener(fsConfEventListener)
  val connManager = new ConnectionManager(eslConnection, eslEventListener, fsConfEventListener)

  connManager.start()

  val fsApplication = new FreeswitchApplication(connManager, fsProfile)
  fsApplication.start()

  val inJsonMsgBus = new InsonMsgBus
  val redisMessageHandlerActor = system.actorOf(RxJsonMsgHdlrActor.props(fsApplication))
  inJsonMsgBus.subscribe(redisMessageHandlerActor, toFsAppsJsonChannel)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(system, inJsonMsgBus), "redis-subscriber")

}
