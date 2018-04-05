package org.bigbluebutton

import akka.actor.ActorSystem
import io.vertx.core.Vertx

class ConnectionManager(system: ActorSystem, vertx: Vertx) {

  def connectionCreated(id: String): Unit = {

  }

  def connectionClosed(id: String): Unit = {

  }

  def onMessageReceived(id: String, msg: String): Unit = {

  }
}
