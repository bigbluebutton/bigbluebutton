package org.bigbluebutton.api2.bus

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreMsg }

trait ReceivedMessageRouter extends SystemConfiguration {
  val msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus

  def publish(msg: MsgFromAkkaApps): Unit = {
    msgFromAkkaAppsEventBus.publish(msg)
  }

  def send(envelope: BbbCoreEnvelope, msg: BbbCoreMsg): Unit = {
    val event = MsgFromAkkaApps(fromAkkaAppsChannel, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)
  }
}
