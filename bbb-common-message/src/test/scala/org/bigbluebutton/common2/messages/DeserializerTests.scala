package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.{ TestFixtures, UnitSpec2 }

import scala.util.{ Failure, Success }

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
      case Failure(ex)           => fail("Failed to decode json message " + ex)
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
      case Success(envJsNodeMsg) =>
        assert(envJsNodeMsg.core.isInstanceOf[JsonNode])
        val (msg, exception) = Deserializer.toBbbCommonMsg[CreateMeetingReqMsg](envJsNodeMsg.core)
        msg match {
          case Some(cmrq) => assert(cmrq.isInstanceOf[CreateMeetingReqMsg])
          case None       => fail("Failed to decode CreateMeetingReqMsg")
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
      case Success(envJsNodeMsg) =>
        assert(envJsNodeMsg.core.isInstanceOf[JsonNode])
        val (msg, exception) = Deserializer.toBbbCommonMsg[CreateMeetingReqMsg](envJsNodeMsg.core)
        msg match {
          case Some(cmrq) => assert(cmrq.isInstanceOf[CreateMeetingReqMsg])
          case None       => fail("Should have successfully decoded CreateMeetingReqMsg ")
        }
      case Failure(ex) => fail("Failed to decode json message " + ex)
    }
  }

  "It" should "be able to deserialize message from client" in {
    val jsonMsg =
      """
        |{
        |    "header": {
        |        "name": "foo",
        |        "meetingId": "mId",
        |        "userId": "uId"
        |    },
        |    "body": {
        |        "meetingId": "mId",
        |        "userId": "uId",
        |        "token": "myToken",
        |        "replyTo": "replyHere",
        |        "sessionId": "mySessionId"
        |    }
        |}
      """.stripMargin

    val (result, error) = Deserializer.toBbbCoreMessageFromClient(jsonMsg)
    result match {
      case Some(msg) => assert(msg.header.name == "foo")
      case None      => fail("Should have deserialized message but failed with error: " + error)
    }
  }
}
