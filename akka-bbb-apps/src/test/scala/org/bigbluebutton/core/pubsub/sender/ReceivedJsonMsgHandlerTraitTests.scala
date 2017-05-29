package org.bigbluebutton.core.pubsub.sender

import com.fasterxml.jackson.databind.JsonDeserializer
import org.bigbluebutton.common2.messages.MessageBody.CreateMeetingReqMsgBody
import org.bigbluebutton.core.{ AppsTestFixtures, UnitSpec }
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.bus.{ BbbMsgRouterEventBus, ReceivedJsonMessage }
import org.bigbluebutton.core.pubsub.senders.ReceivedJsonMsgHandlerTrait
import org.mockito.Mockito._
import org.scalatest.mock.MockitoSugar

class ReceivedJsonMsgHandlerTraitTests extends UnitSpec with AppsTestFixtures with MockitoSugar {

  class MessageRouter(val eventBus: BbbMsgRouterEventBus) extends ReceivedJsonMsgHandlerTrait {

  }

  "It" should "be able to decode envelope and core message" in {

    val mockEventBus = mock[BbbMsgRouterEventBus]

    val classUnderTest = new MessageRouter(mockEventBus)

    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(defaultProps)
    val req = CreateMeetingReqMsg(header, body)
    val msg = BbbCommonEnvCoreMsg(envelope, req)
    println(msg)

    object JsonDeserializer extends Deserializer

    val receivedJson = ReceivedJsonMessage("test-channel", JsonUtil.toJson(msg))
    for {
      envJsonNode <- JsonDeserializer.toJBbbCommonEnvJsNodeMsg(receivedJson.data)
    } yield classUnderTest.routeCreateMeetingReqMsg(envJsonNode.envelope, envJsonNode.core)

    // Then verify the class under test used the mock object as expected
    // The disconnect user shouldn't be called as user has ability to eject another user
    //verify(mockEventBus, times(1)).publish()
  }
}
