package org.bigbluebutton.client.meeting

import akka.actor.{Actor, ActorLogging, Props}

object UserActor {
  def props(userId: String): Props = Props(classOf[UserActor], userId)
}

class UserActor(val userId: String) extends Actor with ActorLogging {

  def receive = {
    case msg: Connect => //handleConnect(msg)
    case msg: Disconnect => //handleDisconnect(msg)
    case msg: MessageFromClient => //handleMessageFromClient(msg)

  }
}

case class Connection(connId: String, sessionId: String)

object Connections {

}

class Connections {
  private var conns: collection.immutable.HashMap[String, Connection] =
    new collection.immutable.HashMap[String, Connection]

  private def toVector: Vector[Connection] = conns.values.toVector

  private def save(conn: Connection): Connection = {
    conns += conn.connId -> conn
    conn
  }

  private def remove(id: String): Option[Connection] = {
    val conn = conns.get(id)
    conn foreach { c =>  conns -= id }
    conn
  }
}
