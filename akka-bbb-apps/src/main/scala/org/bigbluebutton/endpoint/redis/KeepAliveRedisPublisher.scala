package org.bigbluebutton.endpoint.redis

import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import akka.actor.ActorSystem
import org.bigbluebutton.SystemConfiguration

class KeepAliveRedisPublisher(val system: ActorSystem, sender: RedisPublisher) extends SystemConfiguration {

  val startedOn = System.currentTimeMillis()

  system.scheduler.schedule(2 seconds, 5 seconds) {
    //val msg = new BbbAppsIsAliveMessage(startedOn, System.currentTimeMillis())
    // sender.publish("bigbluebutton:from-bbb-apps:keepalive", msg.toJson())
  }
}
