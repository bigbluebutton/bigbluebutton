package org.bigbluebutton.client



class ClientInGW(val clientGWApplication: ClientGWApplication) extends IClientInGW {

  def connect(connInfo: ConnInfo): Unit = {

  }

  def disconnect(connInfo: ConnInfo): Unit = {

  }

  def handleMessageFromClient(connInfo: ConnInfo, json: String): Unit = {

  }

  def send(channel: String, json: String): Unit = {

  }
}