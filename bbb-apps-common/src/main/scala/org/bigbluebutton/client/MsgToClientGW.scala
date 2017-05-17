package org.bigbluebutton.client

import org.bigbluebutton.red5.client.messaging.{BroadcastToMeetingMsg, DirectToClientMsg, IConnectionInvokerService}

sealed trait SystemMessage
case class DisconnectConnection(connId: String) extends SystemMessage
case class DisconnectAllConnections(scope: String) extends SystemMessage

class MsgToClientGW(val connInvokerService: IConnectionInvokerService) {

  def broadcastToMeeting(msg: BroadcastToMeetingMsg): Unit = {
    connInvokerService.sendMessage(msg)
  }

  def directToClient(msg: DirectToClientMsg): Unit = {
    connInvokerService.sendMessage(msg)
  }

  def handleSystemMessage(msg: SystemMessage): Unit = {

  }
}
