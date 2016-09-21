package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{ Future, Await }
import scala.concurrent.ExecutionContext.Implicits.global
import org.freeswitch.esl.client.manager.DefaultManagerConnection
import org.bigbluebutton.endpoint.redis.{ RedisPublisher, AppsRedisSubscriberActor }
import org.bigbluebutton.freeswitch.VoiceConferenceService
import org.bigbluebutton.freeswitch.voice.FreeswitchConferenceEventListener
import org.bigbluebutton.freeswitch.voice.freeswitch.{ ESLEventListener, ConnectionManager, FreeswitchApplication }
import org.bigbluebutton.freeswitch.voice.IVoiceConferenceService
import org.bigbluebutton.freeswitch.pubsub.receivers.RedisMessageReceiver

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-fsesl-system")

  val redisPublisher = new RedisPublisher(system)

  val eslConnection = new DefaultManagerConnection(eslHost, eslPort, eslPassword);

  val voiceConfService = new VoiceConferenceService(redisPublisher)

  val fsConfEventListener = new FreeswitchConferenceEventListener(voiceConfService)
  fsConfEventListener.start()

  val eslEventListener = new ESLEventListener(fsConfEventListener)
  val connManager = new ConnectionManager(eslConnection, eslEventListener, fsConfEventListener)

  connManager.start()

  val fsApplication = new FreeswitchApplication(connManager, fsProfile)
  fsApplication.start()

  val redisMsgReceiver = new RedisMessageReceiver(fsApplication)

  val redisSubscriberActor = system.actorOf(AppsRedisSubscriberActor.props(system, redisMsgReceiver), "redis-subscriber")
}
