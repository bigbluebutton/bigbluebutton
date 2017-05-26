package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.{TestFixtures, UnitSpec2}


class DeserializerTests extends UnitSpec2 with TestFixtures {

  object Deserializer extends Deserializer

  "It" should "be able to decode envelope and core message" in {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(defaultProps)
    val req = CreateMeetingReqMsg(header, body)
    val msg = BbbCommonEnvCoreMsg(envelope, req)
    println(msg)
    assert(msg.envelope.name == CreateMeetingReqMsg.NAME)
    assert(msg.core.isInstanceOf[CreateMeetingReqMsg])
    val map = Deserializer.toJBbbCommonEnvJsNodeMsg(JsonUtil.toJson(msg))
    println(map)
    map match {
      case Some(envJsNodeMsg) => assert(envJsNodeMsg.core.isInstanceOf[JsonNode])
      case None => fail("Failed to decode json message")
    }
  }

  "It" should "be able to decode CreateMeetingReqMsg" in {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(defaultProps)
    val req = CreateMeetingReqMsg(header, body)
    val msg = BbbCommonEnvCoreMsg(envelope, req)
    println(msg)
    assert(msg.envelope.name == CreateMeetingReqMsg.NAME)
    assert(msg.core.isInstanceOf[CreateMeetingReqMsg])
    val map = Deserializer.toJBbbCommonEnvJsNodeMsg(JsonUtil.toJson(msg))
    println(map)

    map match {
      case Some(envJsNodeMsg) => assert(envJsNodeMsg.core.isInstanceOf[JsonNode])
        val createMeetingReqMsg = Deserializer.toCreateMeetingReqMsg(envJsNodeMsg.envelope, envJsNodeMsg.core)
        createMeetingReqMsg match {
          case Some(cmrq) => assert(cmrq.isInstanceOf[CreateMeetingReqMsg])
          case None => fail("Failed to decode CreateMeetingReqMsg")
        }
      case None => fail("Failed to decode json message")
    }



  }
}
