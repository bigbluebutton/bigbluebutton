package org.bigbluebutton.client

import org.bigbluebutton.client.bus.{ MsgFromAkkaApps, MsgFromAkkaAppsEventBus }

trait ReceivedMessageRouter {
  val msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus

  def publish(msg: MsgFromAkkaApps): Unit = {
    msgFromAkkaAppsEventBus.publish(msg)
  }

  def send()
}
