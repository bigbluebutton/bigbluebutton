package org.bigbluebutton.core

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreMsg }
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.bus._

object OutMessageGatewayImp {
  def apply(
    outgoingEventBus: OutgoingEventBus,
    outBus2:          OutEventBus2,
    recordBus:        RecordingEventBus
  ) =
    new OutMessageGatewayImp(outgoingEventBus, outBus2, recordBus)
}

class OutMessageGatewayImp(
  outgoingEventBus: OutgoingEventBus,
  outBus2:          OutEventBus2,
  recordBus:        RecordingEventBus
) extends OutMessageGateway
    with SystemConfiguration {

  def send1(msg: IOutMessage) {
    outgoingEventBus.publish(BigBlueButtonOutMessage(outMessageChannel, msg))
  }

  def send(msg: BbbCommonEnvCoreMsg): Unit = {
    outBus2.publish(BbbOutMessage(outBbbMsgMsgChannel, msg))
  }

  def record(msg: BbbCoreMsg): Unit = {
    recordBus.publish(BbbRecordMessage(recordServiceMessageChannel, msg))
  }
}
