package org.bigbluebutton.api2.bus

import org.bigbluebutton.api.IReceivedOldMessageHandler
import org.bigbluebutton.api.messaging.messages.IMessage

class OldMessageReceivedGW(handler: IReceivedOldMessageHandler) {

  def handle(msg: IMessage): Unit = {
    handler.handleMessage(msg)
  }

}
