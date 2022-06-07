package org.bigbluebutton.core2

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.bus.{ BbbMsgEvent, BbbMsgRouterEventBus }

trait ReceivedMessageRouter extends SystemConfiguration {
  val eventBus: BbbMsgRouterEventBus

  def publish(msg: BbbMsgEvent): Unit = {
    eventBus.publish(msg)
  }

}
