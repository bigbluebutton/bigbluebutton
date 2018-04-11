package org.bigbluebutton

import akka.actor.{ Actor, ActorContext, ActorLogging, Props }
import io.vertx.core.{ Handler, Vertx }
import io.vertx.core.eventbus.{ Message, MessageConsumer }

object Connection {
  def apply(connId: String, vertx: Vertx)(implicit context: ActorContext): Connection = new Connection(connId, vertx)(context)
}

class Connection(val connId: String, vertx: Vertx)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(ConnectionActor.props(connId, vertx), "connActor" + "-" + connId)

  val consumer: MessageConsumer[String] = vertx.eventBus().consumer(connId)
  consumer.handler(new MyConnHandler())
}

object ConnectionActor {
  def props(connId: String, vertx: Vertx): Props = Props(classOf[ConnectionActor])
}

class ConnectionActor(connId: String, vertx: Vertx) extends Actor with ActorLogging {

  def receive = {
    case _ => log.debug("***** Connection cannot handle msg ")
  }
}

class MyConnHandler extends Handler[Message[String]] {
  def handle(message: Message[String]) = {
    println("My Handler " + message.body())
  }
}