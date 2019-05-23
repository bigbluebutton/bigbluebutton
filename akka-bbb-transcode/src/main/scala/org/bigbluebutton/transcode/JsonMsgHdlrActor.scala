package org.bigbluebutton.transcode

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.bus.ReceivedJsonMessage
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.transcode.core.TranscodingInGW

import com.fasterxml.jackson.databind.JsonNode

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props

object JsonMsgHdlrActor {
  def props(inGW: TranscodingInGW): Props = Props(classOf[JsonMsgHdlrActor], inGW)
}

class JsonMsgHdlrActor(val inGW: TranscodingInGW) extends Actor with ActorLogging
  with SystemConfiguration with JsonMsgDeserializer {
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
      case StartProbingSysReqMsg.NAME =>
        routeStartProbingSysReqMsg(envelope, jsonNode)
      case StartTranscoderSysReqMsg.NAME =>
        routeStartTranscoderSysReqMsg(envelope, jsonNode)
      case StopTranscoderSysReqMsg.NAME =>
        routeStopTranscoderSysReqMsg(envelope, jsonNode)
      case UpdateTranscoderSysReqMsg.NAME =>
        routeUpdateTranscoderSysReqMsg(envelope, jsonNode)
      case StopMeetingTranscodersSysCmdMsg.NAME =>
        routeStopMeetingTranscodersSysCmdMsg(envelope, jsonNode)
      case _ => // do nothing
    }
  }
}
