package org.bigbluebutton

import io.vertx.core.Vertx
import akka.actor._
import akka.actor.ActorLogging
import org.bigbluebutton.vertx.IAkkaToVertxGateway
import org.bigbluebutton.vertx.AkkaToVertxGateway

object AuthService {
  def props(gw: AkkaToVertxGateway): Props =
    Props(classOf[AuthService], gw)
}

class AuthService(gw: AkkaToVertxGateway)
    extends Actor with ActorLogging {

  def receive = {
    case msg: String => {
      println("****** Authenticating " + msg)
      sender ! "Let `em in!"
    }
    case _ => log.error("Cannot handle message ")
  }
}