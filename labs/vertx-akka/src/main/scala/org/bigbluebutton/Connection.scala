package org.bigbluebutton

import akka.actor.{Actor, ActorLogging, Props}

object Connection {
  def props(connId: String): Props =
    Props(classOf[Connection])
}

class Connection(connId: String) extends Actor with ActorLogging {

  def receive = {
    case _ => log.debug("***** Connection cannot handle msg ")
  }
}
