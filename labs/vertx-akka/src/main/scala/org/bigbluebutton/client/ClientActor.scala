package org.bigbluebutton.client

import akka.actor.{ Actor, ActorContext, ActorLogging, Props }
import org.bigbluebutton.client.bus.FromConnEventBus

object Client {
  def apply(clientId: String, connEventBus: FromConnEventBus)(implicit context: ActorContext): Client = new Client(clientId, connEventBus)(context)
}

class Client(val clientId: String, connEventBus: FromConnEventBus)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(ClientActor.props(clientId, connEventBus), "clientActor" + "-" + clientId)
}

object ClientActor {
  def props(clientId: String, connEventBus: FromConnEventBus): Props = Props(classOf[ClientActor], clientId, connEventBus)
}

class ClientActor(clientId: String, connEventBus: FromConnEventBus) extends Actor with ActorLogging {

  def receive = {
    case _ => log.debug("***** UserActor cannot handle msg ")
  }
}
