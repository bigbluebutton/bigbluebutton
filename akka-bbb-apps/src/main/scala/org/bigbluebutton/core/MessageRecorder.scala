package org.bigbluebutton.core

import org.bigbluebutton.common2.msgs.BbbCoreMsg

object MessageRecorder {
  def record(outGW: OutMessageGateway, record: Boolean, msg: BbbCoreMsg): Unit = {
    if (record) {
      outGW.record(msg)
    }
  }
}
