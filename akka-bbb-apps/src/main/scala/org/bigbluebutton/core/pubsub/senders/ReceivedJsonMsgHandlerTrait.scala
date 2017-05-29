package org.bigbluebutton.core.pubsub.senders

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.bus.{ BbbMsgEvent, BbbMsgRouterEventBus, ReceivedJsonMessage }

trait ReceivedJsonMsgHandlerTrait extends SystemConfiguration {
  val eventBus: BbbMsgRouterEventBus
  object JsonDeserializer extends Deserializer

  def send(msg: BbbMsgEvent): Unit = {
    println("******************** Routing " + msg.payload.envelope.name)
    eventBus.publish(msg)
  }

  def handleReceivedJsonMessage(msg: ReceivedJsonMessage): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toJBbbCommonEnvJsNodeMsg(msg.data)
    } yield route(envJsonNode.envelope, envJsonNode.core)
  }

  def route(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    println("*************** Route envelope name " + envelope.name)
    envelope.name match {
      case CreateMeetingReqMsg.NAME =>
        println("**************** Route CreateMeetingReqMsg")
        for {
          m <- routeCreateMeetingReqMsg(envelope, jsonNode)
        } yield {
          println("************ Sending CreateMeetingReqMsg")
          send(m)
        }
      case ValidateAuthTokenReqMsg.NAME =>
        println("**************** Route ValidateAuthTokenReqMsg")
        for {
          m <- routeValidateAuthTokenReqMsg(envelope, jsonNode)
        } yield {
          println("************ Sending ValidateAuthTokenReqMsg")
          send(m)
        }
      case RegisterUserReqMsg.NAME =>
        println("**************** Route RegisterUserReqMsg")
        for {
          m <- routeRegisterUserReqMsg(envelope, jsonNode)
        } yield {
          println("************ Sending RegisterUserReqMsg")
          send(m)
        }
      case _ =>
        println("************ Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

  def routeCreateMeetingReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[BbbMsgEvent] = {
    for {
      msg <- JsonDeserializer.toCreateMeetingReqMsg(envelope, jsonNode)
    } yield {
      BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
    }
  }

  def routeValidateAuthTokenReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[BbbMsgEvent] = {
    for {
      msg <- JsonDeserializer.toValidateAuthTokenReqMsg(envelope, jsonNode)
    } yield {
      BbbMsgEvent(msg.header.meetingId, BbbCommonEnvCoreMsg(envelope, msg))
    }
  }

  def routeRegisterUserReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[BbbMsgEvent] = {
    for {
      msg <- JsonDeserializer.toRegisterUserReqMsg(envelope, jsonNode)
    } yield {
      // Route via meeting manager as there is a race condition if we send directly to meeting
      // because the meeting actor might not have been created yet.
      BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, msg))
    }
  }
}
