package org.bigbluebutton

import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }
import org.bigbluebutton.client.bus.{ ConnectionCreated, ConnectionDestroyed, InternalMessageBus }
import org.bigbluebutton.client.Client

class ClientManager(system: ActorSystem, connEventBus: InternalMessageBus) {
  val actorRef = system.actorOf(ClientManagerActor.props(connEventBus), "clientMgrActor")
}

object ClientManagerActor {
  val CLIENT_MANAGER_CHANNEL = "client-manager-channel"

  def props(connEventBus: InternalMessageBus): Props = Props(classOf[ClientManagerActor], connEventBus)
}

case class ClientManagerActor(connEventBus: InternalMessageBus) extends Actor with ActorLogging {
  private var clients = new collection.immutable.HashMap[String, Client]

  def receive = {
    case m: ConnectionCreated =>
      val client = Client(m.connInfo.connId, connEventBus)
      clients += client.clientId -> client
      client.actorRef forward (m)
    case m: ConnectionDestroyed =>
      val client = clients.get(m.connInfo.connId)
      client foreach { u =>
        clients -= m.connInfo.connId
        u.actorRef forward (m)
      }

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
