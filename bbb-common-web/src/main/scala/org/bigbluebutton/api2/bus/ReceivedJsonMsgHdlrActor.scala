package org.bigbluebutton.api2.bus

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.messages._
import com.fasterxml.jackson.databind.JsonNode

import scala.util.{Failure, Success}

object ReceivedJsonMsgHdlrActor {
  def props(msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus): Props =
    Props(classOf[ReceivedJsonMsgHdlrActor], msgFromAkkaAppsEventBus)
}

class ReceivedJsonMsgHdlrActor(val msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus)
  extends Actor
    with ActorLogging
    with SystemConfiguration
    with ReceivedMessageRouter {

  object JsonDeserializer extends Deserializer

  def receive = {
    case msg: JsonMsgFromAkkaApps => handleReceivedJsonMessage(msg)


    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: JsonMsgFromAkkaApps): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield route(envJsonNode.envelope, envJsonNode.core)
  }

  def route(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    log.debug("*************** Route envelope name " + envelope.name)
    envelope.name match {
      case MeetingCreatedEvtMsg.NAME =>
        log.debug("**************** Route MeetingCreatedEvtMsg")
        for {
          m <- routeMeetingCreatedEvtMsg(jsonNode)
        } yield {
          log.debug("************ Sending MeetingCreatedEvtMsg")
          send(envelope, m)
        }
      case _ =>
        log.debug("************ Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

  def send(msg: MsgFromAkkaApps): Unit = {
    log.debug("******************** Routing " + msg.payload.envelope.name)
    msgFromAkkaAppsEventBus.publish(msg)
  }

  def routeMeetingCreatedEvtMsg(jsonNode: JsonNode): Option[MeetingCreatedEvtMsg] = {
    JsonDeserializer.toBbbCommonMsg[MeetingCreatedEvtMsg](jsonNode) match {
      case Success(msg) => Some(msg.asInstanceOf[MeetingCreatedEvtMsg])
      case Failure(ex) =>
        log.error("Failed to ValidateAuthTokenReqMsg message " + ex)
        None
    }
  }
}
