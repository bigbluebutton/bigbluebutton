package org.bigbluebutton.core

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages.BbbMsg
import org.bigbluebutton.core.bus.{ BbbOutMessage, BigBlueButtonOutMessage, OutEventBus2, OutgoingEventBus }
import org.bigbluebutton.core.api.IOutMessage

object OutMessageGateway {
  def apply(outgoingEventBus: OutgoingEventBus, outBus2: OutEventBus2) =
    new OutMessageGateway(outgoingEventBus, outBus2)
}

class OutMessageGateway(outgoingEventBus: OutgoingEventBus, outBus2: OutEventBus2) extends SystemConfiguration {

  def send(msg: IOutMessage) {
    outgoingEventBus.publish(BigBlueButtonOutMessage(outMessageChannel, msg))
  }

  def send(msg: BbbMsg): Unit = {
    outBus2.publish(BbbOutMessage(outBbbMsgMsgChannel, msg))
  }
}
