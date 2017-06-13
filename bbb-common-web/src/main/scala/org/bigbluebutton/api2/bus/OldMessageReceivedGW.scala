package org.bigbluebutton.api2.bus

import org.bigbluebutton.api.IReceivedOldMessageHandler


class OldMessageReceivedGW(handler: IReceivedOldMessageHandler) {

  def handle(pattern: String, channel: String, msg: String): Unit = {
    handler.handleMessage(pattern, channel, msg)
  }
}
