package org.bigbluebutton

import io.vertx.core.Vertx
import akka.actor._
import akka.actor.ActorLogging
import org.bigbluebutton.vertx.IAkkaToVertxGateway
import org.bigbluebutton.vertx.AkkaToVertxGateway

object EchoService {
  def props(gw: AkkaToVertxGateway, vertx: Vertx): Props =
    Props(classOf[EchoService], gw, vertx)
}

class EchoService(gw: AkkaToVertxGateway, vertx: Vertx) extends Actor with ActorLogging {

  private var i: Int = 0;

  def receive = {
    case msg: String => {
      //println("****** Echoing " + msg)
      gw.send("FROM ECHO: " + msg)
      i += 1
      if (i > 50) {
        //gw.send("CLOSE_SOCKET")
        vertx.eventBus.publish("to-vertx", "CLOSE_SOCKET")
      }
    }
    case _ => log.error("Cannot handle message ")
  }
}
