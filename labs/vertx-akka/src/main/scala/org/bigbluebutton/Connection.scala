package org.bigbluebutton

import akka.actor.{Actor, ActorContext, ActorLogging, Props}

object Connection {
  def apply()(implicit context: ActorContext): Connection = new Connection()
}

class Connection() (implicit val context: ActorContext) {

}

object ConnectionActor {
  def props(connId: String): Props = Props(classOf[ConnectionActor])
}

class ConnectionActor(connId: String) extends Actor with ActorLogging {

  def receive = {
    case _ => log.debug("***** Connection cannot handle msg ")
  }
}
