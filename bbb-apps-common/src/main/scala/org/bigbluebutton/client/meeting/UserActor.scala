package org.bigbluebutton.client.meeting

import akka.actor.{Actor, ActorLogging}


class UserActor(val userId: String) extends Actor with ActorLogging {

  def receive = {
    case msg: Connect => handleConnect(msg)
    case msg: Disconnect => handleDisconnect(msg)
    case msg: MessageFromClient => handleMessageFromClient(msg)

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
    for {
      conn <- conns.get(id)
      conns -= id
    } yield {
      conn
    }
  }
}
