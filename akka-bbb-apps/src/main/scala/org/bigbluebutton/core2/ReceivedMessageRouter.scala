package org.bigbluebutton.core2

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.bus.{ BbbMsgEvent, BbbMsgRouterEventBus }

trait ReceivedMessageRouter extends SystemConfiguration {
  val eventBus: BbbMsgRouterEventBus

  def publish(msg: BbbMsgEvent): Unit = {
    eventBus.publish(msg)
  }

  def send(envelope: BbbCoreEnvelope, msg: CreateMeetingReqMsg): Unit = {
    val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)
  }

  def send(envelope: BbbCoreEnvelope, msg: ValidateAuthTokenReqMsg): Unit = {
    val event = BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)
  }

  def send(envelope: BbbCoreEnvelope, msg: RegisterUserReqMsg): Unit = {
    val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)
  }
}
