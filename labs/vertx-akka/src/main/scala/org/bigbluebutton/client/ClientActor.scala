package org.bigbluebutton.client

import akka.actor.{ Actor, ActorContext, ActorLogging, Props }
import org.bigbluebutton.client.bus._
import org.bigbluebutton.client.meeting.Connections

object Client {
  def apply(clientId: String, connEventBus: InternalMessageBus)(implicit context: ActorContext): Client = new Client(clientId, connEventBus)(context)
}

class Client(val clientId: String, connEventBus: InternalMessageBus)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(ClientActor.props(clientId, connEventBus), "clientActor" + "-" + clientId)
}

object ClientActor {
  def props(clientId: String, connEventBus: InternalMessageBus): Props = Props(classOf[ClientActor], clientId, connEventBus)
}

class ClientActor(clientId: String, connEventBus: InternalMessageBus)
    extends Actor with ActorLogging with SystemConfiguration {

  private val conns = new Connections
  private var authorized = false

  def receive = {
    case m: ConnectionCreated =>
      connEventBus.publish(MsgFromConnBusMsg(fromClientChannel, ClientConnectedMsg(m.connInfo)))
    case m: ConnectionDestroyed =>
      connEventBus.publish(MsgFromConnBusMsg(fromClientChannel, ClientDisconnectedMsg(m.connInfo)))
      context stop self
    case m: MsgFromConnMsg =>
      connEventBus.publish(MsgFromConnBusMsg(fromClientChannel, MsgFromClientMsg(m.connInfo, m.json)))
    case m: DirectMsgToClient =>
      connEventBus.publish(MsgFromConnBusMsg("connActor-" + clientId, MsgToConnMsg(m.data.core.toString())))
    case _ => log.debug("***** ClientActor cannot handle msg ")
  }

  override def preStart(): Unit = {
    super.preStart()
    //println("******** CLIENT ACTOR CREATED " + "clientActor-" + clientId + " *****************************")
    connEventBus.subscribe(self, "clientActor-" + clientId)
    connEventBus.subscribe(self, toClientChannel)

  }

  override def postStop(): Unit = {
    connEventBus.unsubscribe(self, "clientActor-" + clientId)
    connEventBus.unsubscribe(self, toClientChannel)
    super.postStop()
  }
}
