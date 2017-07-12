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
      case GetUsersInVoiceConfSysMsg.NAME =>
        routeGetUsersInVoiceConfSysMsg(envelope, jsonNode)
      case EjectAllFromVoiceConfMsg.NAME =>
        routeEjectAllFromVoiceConfMsg(envelope, jsonNode)
      case EjectUserFromVoiceConfSysMsg.NAME =>
        routeEjectUserFromVoiceConfMsg(envelope, jsonNode)
      case MuteUserInVoiceConfSysMsg.NAME =>
        routeMuteUserInVoiceConfMsg(envelope, jsonNode)
      case TransferUserToVoiceConfSysMsg.NAME =>
        routeTransferUserToVoiceConfMsg(envelope, jsonNode)
      case StartRecordingVoiceConfSysMsg.NAME =>
        routeStartRecordingVoiceConfMsg(envelope, jsonNode)
      case StopRecordingVoiceConfSysMsg.NAME =>
        routeStopRecordingVoiceConfMsg(envelope, jsonNode)
      case ScreenshareStopRtmpBroadcastVoiceConfMsg.NAME =>
        routeDeskshareStopRtmpBroadcastVoiceConfMsg(envelope, jsonNode)
      case ScreenshareStartRtmpBroadcastVoiceConfMsg.NAME =>
        routeDeskshareStartRtmpBroadcastVoiceConfMsg(envelope, jsonNode)
      case _ => // do nothing
    }
  }
}
