package org.bigbluebutton.core.running

import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, UserBroadcastCamStartMsg }
import org.bigbluebutton.core.OutMessageGateway

class OutMsgRouter(record: Boolean, val outGW: OutMessageGateway) {
  def send(msg: BbbCommonEnvCoreMsg): Unit = {
    outGW.send(msg)
    if (record) outGW.record(msg)
  }

  private def record(msg: BbbCommonEnvCoreMsg): Unit = {
    msg.core match {
      case m: UserBroadcastCamStartMsg => outGW.record(msg)
    }
  }
}
