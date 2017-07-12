package org.bigbluebutton.core2

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.MessageSender

object FromAkkaAppsMsgSenderActor {
  def props(msgSender: MessageSender): Props = Props(classOf[FromAkkaAppsMsgSenderActor], msgSender)
}

class FromAkkaAppsMsgSenderActor(msgSender: MessageSender)
    extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _ => log.warning("Cannot handle message ")
  }

  def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    val json = JsonUtil.toJson(msg)

    msg.envelope.name match {
      case SyncGetPresentationInfoRespMsg.NAME => msgSender.send(toHTML5RedisChannel, json)
      case SyncGetMeetingInfoRespMsg.NAME => msgSender.send(toHTML5RedisChannel, json)
      case SyncGetUsersMeetingRespMsg.NAME => msgSender.send(toHTML5RedisChannel, json)

      // Sent to FreeSWITCH
      case ScreenshareStartRtmpBroadcastVoiceConfMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case ScreenshareStopRtmpBroadcastVoiceConfMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case EjectAllFromVoiceConfMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case GetUsersInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case EjectUserFromVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case MuteUserInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case StartRecordingVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case StopRecordingVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case TransferUserToVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)

      case _ => msgSender.send(fromAkkaAppsRedisChannel, json)
    }
  }
}
