package org.bigbluebutton.client



class ClientInGW(val clientGWApp: ClientGWApplication) extends IClientInGW {

  def connect(connInfo: ConnInfo): Unit = {
    clientGWApp.connect(connInfo)
  }

  def disconnect(connInfo: ConnInfo): Unit = {
    clientGWApp.disconnect(connInfo)
  }

  def handleMsgFromClient(connInfo: ConnInfo, json: String): Unit = {
    clientGWApp.handleMsgFromClient(connInfo, json)
  }
}