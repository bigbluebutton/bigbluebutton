package org.bigbluebutton.core

import org.bigbluebutton.common2.messages.BbbCoreMsg

object MessageRecorder {
  def record(outGW: OutMessageGateway, record: Boolean, msg: BbbCoreMsg): Unit = {
    if (record) {
      outGW.record(msg)
    }
  }
}
