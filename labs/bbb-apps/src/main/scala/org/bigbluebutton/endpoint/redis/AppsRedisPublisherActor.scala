package org.bigbluebutton.endpoint.redis

import akka.actor.Props
import redis.RedisClient
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import akka.actor.ActorSystem
import scala.concurrent.Await
import akka.actor.Actor
import org.bigbluebutton.SystemConfiguration

object AppsRedisPublisherActor extends SystemConfiguration {
 
  val channels = Seq("time")
  val patterns = Seq("pattern.*")
  
  def props(system: ActorSystem): Props = 
	      Props(classOf[AppsRedisPublisherActor], 
	            system, redisHost, redisPort)
}

class AppsRedisPublisherActor(val system: ActorSystem, 
    val host: String, val port: Int) extends Actor {
  
  val redis = RedisClient(host, port)(system)

  val futurePong = redis.ping()
  println("Ping sent!")
  futurePong.map(pong => {
    println(s"Redis replied with a $pong")
  })
  
  Await.result(futurePong, 5 seconds)
  
  def publish(channel: String, msg: String) {
    println("PUBLISH TO [" + channel + "]: \n [" + msg + "]")
 //   redis.publish("time", System.currentTimeMillis())
  }
  
  def receive = {
    //case msg: JsonMessage => publish(msg.channel, msg.message)
    case msg:String => println("PUBLISH TO [channel]: \n [" + msg + "]")
  }

}
