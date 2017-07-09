package org.bigbluebutton.client

import org.bigbluebutton.red5.client.IReceivedOldMessageHandler


class OldMessageReceivedGW(handler: IReceivedOldMessageHandler) {

  def handle(pattern: String, channel: String, msg: String): Unit = {
    handler.handleMessage(pattern, channel, msg)
  }
}
