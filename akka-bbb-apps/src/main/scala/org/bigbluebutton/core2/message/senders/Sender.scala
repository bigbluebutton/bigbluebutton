package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.messages.BbbCommonEnvCoreMsg
import org.bigbluebutton.core.OutMessageGateway

object Sender {
  def send(outGW: OutMessageGateway, msg: BbbCommonEnvCoreMsg): Unit = {
    outGW.send(msg)
  }
}
