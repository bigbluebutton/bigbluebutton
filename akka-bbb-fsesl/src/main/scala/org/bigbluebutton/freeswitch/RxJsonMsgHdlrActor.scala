package org.bigbluebutton.freeswitch

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.bus.ReceivedJsonMessage
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.freeswitch.voice.freeswitch.FreeswitchApplication

import com.fasterxml.jackson.databind.JsonNode

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props

object RxJsonMsgHdlrActor {
  def props(fsApp: FreeswitchApplication): Props =
    Props(classOf[RxJsonMsgHdlrActor], fsApp)
}

class RxJsonMsgHdlrActor(val fsApp: FreeswitchApplication) extends Actor with ActorLogging
  with SystemConfiguration with RxJsonMsgDeserializer {
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
    //log.debug("Route envelope name " + envelope.name)
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
      case CheckRunningAndRecordingToVoiceConfSysMsg.NAME =>
        routeCheckRunningAndRecordingToVoiceConfSysMsg(envelope, jsonNode)
      case GetUsersStatusToVoiceConfSysMsg.NAME =>
        routeGetUsersStatusToVoiceConfSysMsg(envelope, jsonNode)
      case _ => // do nothing
    }
  }
}
