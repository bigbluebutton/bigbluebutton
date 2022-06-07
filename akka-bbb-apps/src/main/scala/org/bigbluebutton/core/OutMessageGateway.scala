package org.bigbluebutton.core

import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg }

trait OutMessageGateway {

  def send(msg: BbbCommonEnvCoreMsg): Unit

  def record(msg: BbbCommonEnvCoreMsg): Unit
}
