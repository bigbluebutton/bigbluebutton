package org.bigbluebutton.core.pubsub.senders

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core2.ReceivedMessageRouter

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
    } yield handle(envJsonNode.envelope, envJsonNode.core)
  }

  def handle(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    log.debug("Route envelope name " + envelope.name)
    envelope.name match {
      case CreateMeetingReqMsg.NAME =>
        routeCreateMeetingReqMsg(envelope, jsonNode)
      case ValidateAuthTokenReqMsg.NAME =>
        routeValidateAuthTokenReqMsg(envelope, jsonNode)
      case RegisterUserReqMsg.NAME =>
        routeRegisterUserReqMsg(envelope, jsonNode)
      case UserBroadcastCamStartMsg.NAME =>
        routeUserBroadcastCamStartMsg(envelope, jsonNode)
      case UserBroadcastCamStopMsg.NAME =>
        routeUserBroadcastCamStopMsg(envelope, jsonNode)
      case SendCursorPositionPubMsg.NAME =>
        routeGenericMsg[SendCursorPositionPubMsg](envelope, jsonNode)
      case ModifyWhiteboardAccessPubMsg.NAME =>
        routeGenericMsg[ModifyWhiteboardAccessPubMsg](envelope, jsonNode)
      case GetWhiteboardAccessReqMsg.NAME =>
        routeGenericMsg[GetWhiteboardAccessReqMsg](envelope, jsonNode)
      case ClearWhiteboardPubMsg.NAME =>
        routeGenericMsg[ClearWhiteboardPubMsg](envelope, jsonNode)
      case UndoWhiteboardPubMsg.NAME =>
        routeGenericMsg[UndoWhiteboardPubMsg](envelope, jsonNode)
      case SendWhiteboardAnnotationPubMsg.NAME =>
        routeGenericMsg[SendWhiteboardAnnotationPubMsg](envelope, jsonNode)
      case GetWhiteboardAnnotationsReqMsg.NAME =>
        routeGenericMsg[GetWhiteboardAnnotationsReqMsg](envelope, jsonNode)
      case _ =>
        log.error("Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

}
