package org.bigbluebutton.core

import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreMsg }
import org.bigbluebutton.core.api.IOutMessage

trait OutMessageGateway {

  def send1(msg: IOutMessage)

  def send(msg: BbbCommonEnvCoreMsg): Unit

  def record(msg: BbbCoreMsg): Unit
}
