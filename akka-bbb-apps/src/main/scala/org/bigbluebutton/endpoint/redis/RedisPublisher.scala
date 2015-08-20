package org.bigbluebutton.endpoint.redis

import akka.actor.Props
import redis.RedisClient
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import akka.actor.ActorSystem
import scala.concurrent.Await
import akka.actor.Actor
import org.bigbluebutton.SystemConfiguration

class RedisPublisher(val system: ActorSystem) extends SystemConfiguration {

  val redis = RedisClient(redisHost, redisPort)(system)

  val futurePong = redis.ping()
  //  println("Ping sent!")
  futurePong.map(pong => {
    //    println(s"Redis replied with a $pong")
  })

  Await.result(futurePong, 5 seconds)

  // publish after 2 seconds every 2 or 5 seconds
  //system.scheduler.schedule(2 seconds, 2 seconds)(redis.publish("time", System.currentTimeMillis()))
  //  system.scheduler.schedule(2 seconds, 5 seconds)(redis.publish("bigbluebutton:to-bbb-apps:users", "pattern value"))

  def publish(channel: String, data: String) {
    println("PUBLISH TO [" + channel + "]: \n [" + data + "]")
    redis.publish(channel, data)
  }

}
