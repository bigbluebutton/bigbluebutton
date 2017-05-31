package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.messages.MessageBody.CreateMeetingReqMsgBody
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.{TestFixtures, UnitSpec2}

import scala.util.{Failure, Success}


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
    val json = JsonUtil.toJson(msg)
    println(json)
    val map = Deserializer.toBbbCommonEnvJsNodeMsg(json)
    println(map)
    map match {
      case Success(envJsNodeMsg) => assert(envJsNodeMsg.core.isInstanceOf[JsonNode])
      case Failure(ex) => fail("Failed to decode json message " + ex)
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
    val map = Deserializer.toBbbCommonEnvJsNodeMsg(JsonUtil.toJson(msg))
    println(map)

    map match {
      case Success(envJsNodeMsg) => assert(envJsNodeMsg.core.isInstanceOf[JsonNode])
        val createMeetingReqMsg = Deserializer.toCreateMeetingReqMsg(envJsNodeMsg.envelope, envJsNodeMsg.core)
        createMeetingReqMsg match {
          case Some(cmrq) => assert(cmrq.isInstanceOf[CreateMeetingReqMsg])
          case None => fail("Failed to decode CreateMeetingReqMsg")
        }
      case Failure(ex) => fail("Failed to decode json message " + ex)
    }
  }

  "It" should "be able to decode BbbCoreMsg" in {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(defaultProps)
    val req = CreateMeetingReqMsg(header, body)
    val msg = BbbCommonEnvCoreMsg(envelope, req)
    println(msg)
    assert(msg.envelope.name == CreateMeetingReqMsg.NAME)
    assert(msg.core.isInstanceOf[CreateMeetingReqMsg])

    val map = Deserializer.toBbbCommonEnvJsNodeMsg(JsonUtil.toJson(msg))
    println(map)

    map match {
      case Success(envJsNodeMsg) => assert(envJsNodeMsg.core.isInstanceOf[JsonNode])
        val createMeetingReqMsg = Deserializer.toBbbCommonMsg[CreateMeetingReqMsg](envJsNodeMsg.envelope, envJsNodeMsg.core)
        createMeetingReqMsg match {
          case Success(cmrq) => assert(cmrq.isInstanceOf[CreateMeetingReqMsg])
          case Failure(ex) => fail("Failed to decode CreateMeetingReqMsg " + ex)
        }
      case Failure(ex) => fail("Failed to decode json message " + ex)
    }
  }

}
