package org.bigbluebutton

import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }
import org.bigbluebutton.client.bus.InternalMessageBus
import org.bigbluebutton.client.Client

class ClientManager(system: ActorSystem, connEventBus: InternalMessageBus) {
  val actorRef = system.actorOf(ClientManagerActor.props(connEventBus), "clientMgrActor")
}

case class ConnectionCreated(id: String)
case class ConnectionDestroyed(id: String)

object ClientManagerActor {
  val CLIENT_MANAGER_CHANNEL = "client-manager-channel"

  def props(connEventBus: InternalMessageBus): Props = Props(classOf[ClientManagerActor], connEventBus)
}

case class ClientManagerActor(connEventBus: InternalMessageBus) extends Actor with ActorLogging {
  private var clients = new collection.immutable.HashMap[String, Client]

  def receive = {
    case m: ConnectionCreated =>
      val client = Client(m.id, connEventBus)
      clients += client.clientId -> client
    case m: ConnectionDestroyed =>
      val client = clients.get(m.id)
      client foreach (u => clients -= m.id)

    case _ => log.debug("***** Connection cannot handle msg ")
  }

  override def preStart(): Unit = {
    super.preStart()
    connEventBus.subscribe(self, ClientManagerActor.CLIENT_MANAGER_CHANNEL)
  }

  override def postStop(): Unit = {
    connEventBus.unsubscribe(self, ClientManagerActor.CLIENT_MANAGER_CHANNEL)
    super.postStop()
  }
}
