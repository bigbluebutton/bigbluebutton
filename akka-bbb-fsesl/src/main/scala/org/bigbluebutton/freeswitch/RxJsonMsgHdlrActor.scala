package org.bigbluebutton.freeswitch

import akka.actor.{ Actor, ActorLogging, Props }
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.freeswitch.bus.ReceivedJsonMsg
import org.bigbluebutton.freeswitch.voice.freeswitch.FreeswitchApplication

object RxJsonMsgHdlrActor {
  def props(fsApp: FreeswitchApplication): Props =
    Props(classOf[RxJsonMsgHdlrActor], fsApp)
}

class RxJsonMsgHdlrActor(val fsApp: FreeswitchApplication) extends Actor with ActorLogging
    with SystemConfiguration with RxJsonMsgDeserializer {
  def receive = {
    case msg: ReceivedJsonMsg =>
      log.debug("handling {} - {}", msg.channel, msg.data)
      handleReceivedJsonMessage(msg)
    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: ReceivedJsonMsg): Unit = {
    for {
      envJsonNode <- JsonDeserializer.toBbbCommonEnvJsNodeMsg(msg.data)
    } yield handle(envJsonNode.envelope, envJsonNode.core)
  }

  def handle(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    log.debug("Route envelope name " + envelope.name)
    envelope.name match {
      case EjectAllFromVoiceConfMsg.NAME =>
        routeEjectAllFromVoiceConfMsg(envelope, jsonNode)
      case EjectUserFromVoiceConfMsg.NAME =>
        routeEjectUserFromVoiceConfMsg(envelope, jsonNode)
      case MuteUserInVoiceConfMsg.NAME =>
        routeMuteUserInVoiceConfMsg(envelope, jsonNode)
      case TransferUserToVoiceConfMsg.NAME =>
        routeTransferUserToVoiceConfMsg(envelope, jsonNode)
      case StartRecordingVoiceConfMsg.NAME =>
        routeStartRecordingVoiceConfMsg(envelope, jsonNode)
      case StopRecordingVoiceConfMsg.NAME =>
        routeStopRecordingVoiceConfMsg(envelope, jsonNode)
      case _ => // do nothing
    }
  }
}
