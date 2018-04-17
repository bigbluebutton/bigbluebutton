package org.bigbluebutton

import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }
import org.bigbluebutton.client.bus.FromConnEventBus
import org.bigbluebutton.client.Client

class ClientManager(system: ActorSystem, connEventBus: FromConnEventBus) {
  val actorRef = system.actorOf(ClientManagerActor.props(connEventBus), "clientMgrActor")
}

case class ConnectionCreated(id: String)
case class ConnectionDestroyed(id: String)

object ClientManagerActor {
  def props(connEventBus: FromConnEventBus): Props = Props(classOf[ClientManagerActor], connEventBus)
}

case class ClientManagerActor(connEventBus: FromConnEventBus) extends Actor with ActorLogging {
  private var conns = new collection.immutable.HashMap[String, Client]

  def receive = {
    case m: ConnectionCreated =>
      val conn = Client(m.id, connEventBus)
      conns += conn.clientId -> conn
    case m: ConnectionDestroyed =>
      val conn = conns.get(m.id)
      conn foreach (u => conns -= m.id)

    case _ => log.debug("***** Connection cannot handle msg ")
  }

  override def preStart(): Unit = {
    super.preStart()
    connEventBus.subscribe(self, "clientManager")
  }

  override def postStop(): Unit = {
    connEventBus.unsubscribe(self, "clientManager")
    super.postStop()
  }
}
