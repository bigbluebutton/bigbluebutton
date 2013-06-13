package org.bigbluebutton.core.api

class InMessageGateway {

  def accept(msg: InMessage):Unit = {
    println("******************* GOT AN IN MESSAGE !!!! *********************")
  }
}