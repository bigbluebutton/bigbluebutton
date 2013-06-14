package org.bigbluebutton.core.api

trait IOutMessageListener {

  def handleMessage(msg: IOutMessage)
}