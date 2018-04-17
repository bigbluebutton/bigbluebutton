package org.bigbluebutton

import akka.actor.{ Actor, ActorContext, ActorLogging, ActorRef, Props }
import io.vertx.core.{ Handler, Vertx }
import io.vertx.core.eventbus.{ Message, MessageConsumer }
import org.bigbluebutton.client.bus._

object Connection {
  def apply(connId: String, vertx: Vertx, connEventBus: FromConnEventBus)(implicit context: ActorContext): Connection = new Connection(connId, vertx, connEventBus)(context)
}

class Connection(val connId: String, vertx: Vertx, connEventBus: FromConnEventBus)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(ConnectionActor.props(connId, vertx, connEventBus), "connActor" + "-" + connId)

  val consumer: MessageConsumer[String] = vertx.eventBus().consumer("FOO-" + connId)
  consumer.handler(new MyConnHandler(actorRef))
}

object ConnectionActor {
  def props(connId: String, vertx: Vertx, connEventBus: FromConnEventBus): Props = Props(classOf[ConnectionActor], connId, vertx, connEventBus)
}

case class MsgFoo(msg: String)

class ConnectionActor(connId: String, vertx: Vertx, connEventBus: FromConnEventBus) extends Actor with ActorLogging {

  def receive = {
    case m: SocketDestroyed =>
      val m2 = DisconnectMsg2(ConnInfo2(connId))
      connEventBus.publish(MsgFromConnBusMsg("clientManager", m2))
      context stop self
    case m: SocketRegister =>
      val m2 = MsgFromConnMsg(ConnInfo2(connId), m.channel)
      connEventBus.publish(MsgFromConnBusMsg("clientManager", m2))
    case m: MsgFoo =>
      vertx.eventBus().publish("chat.to.client", "ECHO - " + m.msg)
    case _ => log.debug("***** Connection cannot handle msg ")
  }

  override def preStart(): Unit = {
    super.preStart()
    connEventBus.subscribe(self, "conn-" + connId)
  }

  override def postStop(): Unit = {
    super.postStop()
    connEventBus.unsubscribe(self, "conn-" + connId)
  }
}

class MyConnHandler(actorRef: ActorRef) extends Handler[Message[String]] {
  def handle(message: Message[String]) = {
    println("My Handler " + message.body())
    actorRef ! (MsgFoo(message.body()))
  }
}
