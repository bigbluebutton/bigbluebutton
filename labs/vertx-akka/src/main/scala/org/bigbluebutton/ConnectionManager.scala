package org.bigbluebutton

import akka.actor.{ Actor, ActorContext, ActorLogging, ActorSystem, Props }
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import org.bigbluebutton.client.bus.FromConnEventBus

class ConnectionManager(system: ActorSystem, vertx: Vertx, connEventBus: FromConnEventBus) {
  val actorRef = system.actorOf(ConnManagerActor.props(vertx, connEventBus), "connMgrActor")

  def socketCreated(id: String): Unit = {
    actorRef ! SocketCreated(id)
  }

  def socketClosed(id: String): Unit = {
    actorRef ! SocketDestroyed(id)
  }

  def register(id: String, address: String): Unit = {
    actorRef ! SocketRegister(id, address)
  }

  def onMessageReceived(id: String, msg: JsonObject): Unit = {
    vertx.eventBus().publish("FOO-" + id, msg)
  }
}

case class SocketCreated(id: String)
case class SocketDestroyed(id: String)
case class SocketRegister(id: String, channel: String)

object ConnManagerActor {
  def props(vertx: Vertx, connEventBus: FromConnEventBus): Props = Props(classOf[ConnManagerActor], vertx, connEventBus)
}

case class ConnManagerActor(vertx: Vertx, connEventBus: FromConnEventBus) extends Actor with ActorLogging {
  private var conns = new collection.immutable.HashMap[String, Connection]

  def receive = {
    case m: SocketCreated =>
      val conn = Connection(m.id, vertx, connEventBus)
      conns += conn.connId -> conn
    case m: SocketDestroyed =>
      val conn = conns.get(m.id)
      conn foreach { u =>
        conns -= m.id
        u.actorRef forward (m)
      }
    case m: SocketRegister =>
      val conn = conns.get(m.id)
      conn foreach (u => u.actorRef forward (m))

    case _ => log.debug("***** Connection cannot handle msg ")
  }
}
