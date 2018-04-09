package org.bigbluebutton

import akka.actor.ActorSystem
import io.vertx.core.Vertx

class ConnectionManager(system: ActorSystem, vertx: Vertx) {
  private var conns = new collection.immutable.HashMap[String, Connection]

  def socketCreated(id: String): Unit = {
    val conn = Connection(id)
    conns += conn.connId -> conn
  }

  def socketClosed(id: String): Unit = {
    val conn = conns.get(id)
    conn foreach (u => conns -= id)
    conn
  }

  def register(id: String): Unit = {

  }

  def onMessageReceived(id: String, msg: String): Unit = {

  }
}
