package org.bigbluebutton.client

import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService

sealed trait SystemMessage
case class DisconnectConnection(connId: String) extends SystemMessage
case class DisconnectAllConnections(scope: String) extends SystemMessage

class MsgToClientGW(val connInvokerService: IConnectionInvokerService) {

  def sendMessageToClient(connId: String, json: String): Unit = {

  }

  def handleSystemMessage(msg: SystemMessage): Unit = {

  }
}
