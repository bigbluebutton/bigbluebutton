package org.bigbluebutton.core.ingw

import org.bigbluebutton.common.messages.StartCustomPollRequestMessage
import org.bigbluebutton.core.api.StartCustomPollRequest
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }
import scala.collection.JavaConversions._

trait StartCustomPollRequestMessageHandlerTrait {

  val eventBus: IncomingEventBus

  def handle(msg: StartCustomPollRequestMessage): Unit = {
    eventBus.publish(
      BigBlueButtonEvent(
        msg.payload.meetingId,
        new StartCustomPollRequest(
          msg.payload.meetingId,
          msg.payload.requesterId,
          msg.payload.pollType,
          msg.payload.answers)))
  }
}
