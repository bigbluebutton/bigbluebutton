package org.bigbluebutton.client

import org.bigbluebutton.client.bus.ConnInfo2

class ClientInGW(val clientGWApp: ClientGWApplication) extends IClientInGW {

  def connect(connInfo: ConnInfo2): Unit = {
    clientGWApp.connect(connInfo)
  }

  def disconnect(connInfo: ConnInfo2): Unit = {
    clientGWApp.disconnect(connInfo)
  }

  def handleMsgFromClient(connInfo: ConnInfo2, json: String): Unit = {
    clientGWApp.handleMsgFromClient(connInfo, json)
  }

  def send(channel: String, json: String): Unit = {
    clientGWApp.send(channel, json)
  }
}