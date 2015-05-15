package org.bigbluebutton

import akka.actor.{ ActorSystem, Props }
import akka.io.IO
import akka.util.Timeout
import spray.can.Http
import scala.concurrent.duration._
import redis.RedisClient
import scala.concurrent.{Future, Await}
import scala.concurrent.ExecutionContext.Implicits.global
import org.bigbluebutton.apps.MeetingManager
import org.bigbluebutton.endpoint.redis.AppsRedisPublisherActor
import org.bigbluebutton.endpoint.rest.RestEndpointServiceActor

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")
 
  val redisPublisherActor = system.actorOf(
                            AppsRedisPublisherActor.props(system), 
                            "redis-publisher")
                                  
  val meetingManager = system.actorOf(MeetingManager.props(redisPublisherActor), "meeting-manager")
  
  // create and start our service actor
  val service = system.actorOf(Props(classOf[RestEndpointServiceActor], meetingManager), "rest-service")

  // start a new HTTP server on port 8080 with our service actor as the handler
  IO(Http) ! Http.Bind(service, interface = serviceHost, port = servicePort)
  
}