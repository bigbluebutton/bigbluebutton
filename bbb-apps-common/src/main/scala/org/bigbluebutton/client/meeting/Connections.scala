package org.bigbluebutton.client.meeting

import com.softwaremill.quicklens.modify

case class Connection(connId: String, sessionId: String, active: Boolean)

object Connections {

  def setConnInactive(conns: Connections, conn: Connection): Connection = {
    val inactiveConn = modify(conn)(_.active).setTo(false)
    conns.save(inactiveConn)
    inactiveConn
  }

  def findWithId(conns: Connections, id: String): Option[Connection] = {
    conns.toVector.find(c => c.connId == id)
  }

  def findActiveConnection(conns: Connections): Option[Connection] = {
    conns.toVector.find(c => c.active)
  }

  def add(conns: Connections, conn: Connection): Connection = {
    conns.save(conn)
    conn
  }

  def remove(conns: Connections, connId: String): Option[Connection] = {
    conns.remove(connId)
  }

  def noMoreConnections(conns: Connections): Boolean = {
    conns.toVector.length == 0
  }
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
    conn foreach { c => conns -= id }
    conn
  }
}
