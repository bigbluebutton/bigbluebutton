package org.bigbluebutton

import io.vertx.core.Vertx
import akka.actor._
import akka.actor.ActorLogging
import org.bigbluebutton.vertx.IAkkaToVertxGateway
import org.bigbluebutton.vertx.AkkaToVertxGateway

object EchoService {
  def props(gw: AkkaToVertxGateway): Props =
    Props(classOf[EchoService], gw)
}

class EchoService(gw: AkkaToVertxGateway) extends Actor with ActorLogging {

  def receive = {
    case msg: String => {
      //println("****** Echoing " + msg)
      gw.send("FROM ECHO: " + msg)
    }
    case _ => log.error("Cannot handle message ")
  }
}