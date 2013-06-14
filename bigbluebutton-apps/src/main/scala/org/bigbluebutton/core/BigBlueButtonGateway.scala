package org.bigbluebutton.core

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway

class BigBlueButtonGateway(outGW: MessageOutGateway) {

  private val bbbActor = new BigBlueButtonActor(outGW)
  bbbActor.start
  
  def accept(msg: InMessage):Unit = {
    bbbActor ! msg
  }
}