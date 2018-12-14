package org.bigbluebutton.core.pubsub.sender

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.{ AppsTestFixtures, UnitSpec }
import org.bigbluebutton.core.bus.{ BbbMsgEvent, BbbMsgRouterEventBus }
import org.bigbluebutton.core2.ReceivedMessageRouter
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar

class ReceivedJsonMsgHandlerTraitTests extends UnitSpec
  with AppsTestFixtures with MockitoSugar with SystemConfiguration {

  class MessageRouter(val eventBus: BbbMsgRouterEventBus) extends ReceivedMessageRouter {

  }

  "It" should "be able to decode envelope and core message" in {
    val mockEventBus = mock[BbbMsgRouterEventBus]
    val classUnderTest = new MessageRouter(mockEventBus)
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(defaultProps)
    val req = CreateMeetingReqMsg(header, body)
    val eventMsg = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, req))

    object JsonDeserializer extends Deserializer

    classUnderTest.publish(eventMsg)

    // Then verify the class under test used the mock object as expected
    // The disconnect user shouldn't be called as user has ability to eject another user
    val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, req))
    verify(mockEventBus, times(1)).publish(event)
  }
}
