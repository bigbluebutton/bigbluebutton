package org.bigbluebutton

import akka.actor.{Actor, ActorContext, ActorLogging, Props}
import io.vertx.core.Vertx

object Connection {
  def apply(connId: String, vertx: Vertx)(implicit context: ActorContext): Connection = new Connection(connId, vertx)(context)
}

class Connection(val connId: String, vertx: Vertx) (implicit val context: ActorContext) {
  val actorRef = context.actorOf(ConnectionActor.props(connId, vertx), "connActor" + "-" + connId)
}

object ConnectionActor {
  def props(connId: String, vertx: Vertx): Props = Props(classOf[ConnectionActor])
}

class ConnectionActor(connId: String, vertx: Vertx) extends Actor with ActorLogging {

  def receive = {
    case _ => log.debug("***** Connection cannot handle msg ")
  }
}
