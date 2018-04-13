package org.bigbluebutton

import akka.actor.{ Actor, ActorContext, ActorLogging, ActorSystem, Props }
import io.vertx.core.Vertx

class ConnectionManager(system: ActorSystem, vertx: Vertx) {
  val actorRef = system.actorOf(ConnManagerActor.props(vertx), "connMgrActor")

  def socketCreated(id: String): Unit = {
    actorRef ! SocketCreated(id)
  }

  def socketClosed(id: String): Unit = {
    actorRef ! SocketDestroyed(id)
  }

  def register(id: String): Unit = {

  }

  def onMessageReceived(id: String, msg: String): Unit = {
    vertx.eventBus().publish(id, msg)
  }
}

case class SocketCreated(id: String)
case class SocketDestroyed(id: String)

object ConnManagerActor {
  def props(vertx: Vertx): Props = Props(classOf[ConnManagerActor], vertx)
}

case class ConnManagerActor(vertx: Vertx) extends Actor with ActorLogging {
  private var conns = new collection.immutable.HashMap[String, Connection]

  def receive = {
    case m: SocketCreated =>
      val conn = Connection(m.id, vertx)
      conns += conn.connId -> conn
    case m: SocketDestroyed =>
      val conn = conns.get(m.id)
      conn foreach (u => conns -= m.id)

    case _ => log.debug("***** Connection cannot handle msg ")
  }
}
