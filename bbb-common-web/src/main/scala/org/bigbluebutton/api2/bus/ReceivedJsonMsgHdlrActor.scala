package org.bigbluebutton.api2.bus

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.messages._
import com.fasterxml.jackson.databind.JsonNode

object ReceivedJsonMsgHdlrActor {
  def props(msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus): Props =
    Props(classOf[ReceivedJsonMsgHdlrActor], msgFromAkkaAppsEventBus)
}

class ReceivedJsonMsgHdlrActor(val msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus)
  extends Actor with ActorLogging with SystemConfiguration {

  object JsonDeserializer extends Deserializer

  def receive = {
    case msg: JsonMsgFromAkkaApps => handleReceivedJsonMessage(msg)


    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: JsonMsgFromAkkaApps): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toJBbbCommonEnvJsNodeMsg(msg.data)
    } yield route(envJsonNode.envelope, envJsonNode.core)
  }

  def route(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    println("*************** Route envelope name " + envelope.name)
    envelope.name match {
      case MeetingCreatedEvtMsg.NAME =>
        println("**************** Route MeetingCreatedEvtMsg")
        for {
          m <- routeMeetingCreatedEvtMsg(envelope, jsonNode)
        } yield {
          println("************ Sending MeetingCreatedEvtMsg")
          send(m)
        }
      case _ =>
        println("************ Cannot route envelope name " + envelope.name)
      // do nothing
    }
  }

  def send(msg: MsgFromAkkaApps): Unit = {
    println("******************** Routing " + msg.payload.envelope.name)
    msgFromAkkaAppsEventBus.publish(msg)
  }

  def routeMeetingCreatedEvtMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[MsgFromAkkaApps] = {
    for {
      msg <- JsonDeserializer.toMeetingCreatedEvtMsg(envelope, jsonNode)
    } yield {
      MsgFromAkkaApps(fromAkkaAppsChannel, BbbCommonEnvCoreMsg(envelope, msg))
    }
  }
}
