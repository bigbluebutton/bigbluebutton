package org.bigbluebutton.core

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages.{ BbbCommonEnvCoreMsg, BbbCoreMsg }
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api.IOutMessage

object OutMessageGateway {
  def apply(outgoingEventBus: OutgoingEventBus,
    outBus2: OutEventBus2,
    recordBus: RecordingEventBus) =
    new OutMessageGateway(outgoingEventBus, outBus2, recordBus)
}

class OutMessageGateway(outgoingEventBus: OutgoingEventBus,
    outBus2: OutEventBus2,
    recordBus: RecordingEventBus) extends SystemConfiguration {

  def send(msg: IOutMessage) {
    outgoingEventBus.publish(BigBlueButtonOutMessage(outMessageChannel, msg))
  }

  def send(msg: BbbCommonEnvCoreMsg): Unit = {
    outBus2.publish(BbbOutMessage(outBbbMsgMsgChannel, msg))
  }

  def record(msg: BbbCoreMsg): Unit = {
    recordBus.publish(BbbRecordMessage(recordServiceMessageChannel, msg))
  }
}
