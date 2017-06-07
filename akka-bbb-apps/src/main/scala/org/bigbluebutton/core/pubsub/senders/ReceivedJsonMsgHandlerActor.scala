package org.bigbluebutton.core.pubsub.senders

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.messages.{ BbbCoreEnvelope, CreateMeetingReqMsg, RegisterUserReqMsg, ValidateAuthTokenReqMsg }
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core2.ReceivedMessageRouter

import scala.util.{ Failure, Success }

object ReceivedJsonMsgHandlerActor {
  def props(eventBus: BbbMsgRouterEventBus, incomingJsonMessageBus: IncomingJsonMessageBus): Props =
    Props(classOf[ReceivedJsonMsgHandlerActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHandlerActor(
  val eventBus: BbbMsgRouterEventBus,
  val incomingJsonMessageBus: IncomingJsonMessageBus)
    extends Actor with ActorLogging
    with SystemConfiguration
    with ReceivedJsonMsgDeserializer
    with ReceivedMessageRouter {

  def receive = {
    case msg: ReceivedJsonMessage =>
      log.debug("handling {} - {}", msg.channel, msg.data)
      handleReceivedJsonMessage(msg)
    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: ReceivedJsonMessage): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield route(envJsonNode.envelope, envJsonNode.core)
  }

  def route(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    log.debug("*************** Route envelope name " + envelope.name)
    envelope.name match {
      case CreateMeetingReqMsg.NAME =>
        log.debug("**************** Route CreateMeetingReqMsg")
        for {
          m <- deserializeCreateMeetingReqMsg(jsonNode)
        } yield {
          log.debug("************ Sending CreateMeetingReqMsg")
          send(envelope, m)
        }
      case ValidateAuthTokenReqMsg.NAME =>
        log.debug("**************** Route ValidateAuthTokenReqMsg")
        for {
          m <- routeValidateAuthTokenReqMsg(jsonNode)
        } yield {
          log.debug("************ Sending ValidateAuthTokenReqMsg")
          send(envelope, m)
        }
      case RegisterUserReqMsg.NAME =>
        log.debug("**************** Route RegisterUserReqMsg")
        for {
          m <- routeRegisterUserReqMsg(jsonNode)
        } yield {
          log.debug("************ Sending RegisterUserReqMsg")
          send(envelope, m)
        }
      case _ =>
        log.debug("************ Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }
}
