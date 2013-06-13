package org.bigbluebutton.core.api

class OutMessageGateway(listeners: Set[IOutMessageListener]) {

  def send(msg: OutMessage):Unit = {
    listeners.foreach(l => l.handleMessage(msg))
  }
}