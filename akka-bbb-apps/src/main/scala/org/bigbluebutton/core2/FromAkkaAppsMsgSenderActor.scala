package org.bigbluebutton.core2

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.redis.MessageSender

object FromAkkaAppsMsgSenderActor {
  def props(msgSender: MessageSender): Props = Props(classOf[FromAkkaAppsMsgSenderActor], msgSender)
}

class FromAkkaAppsMsgSenderActor(msgSender: MessageSender)
  extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _                        => log.warning("Cannot handle message ")
  }

  def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    val json = JsonUtil.toJson(msg)

    if (msg.envelope.routing.contains("html5InstanceId")) {
      val html5InstanceId = msg.envelope.routing.get("html5InstanceId")
      html5InstanceId match {
        case Some(id) => {
//          log.info("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~AAAAAA " + id)
          msgSender.send(toHTML5RedisChannel.concat(id), json)
        }
        case _ => log.info("1 no html5InstanceId for " + msg.envelope.name)
      }
      //      log.info("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~AAAAAA " + html5InstanceId)
      //      msgSender.send(toHTML5RedisChannel.concat(html5InstanceId), json)
    } else {
//      log.info("2 no html5InstanceId for " + msg.envelope.name + "   " + msg.envelope.routing)
    }

    msg.envelope.name match {

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
      case CheckRunningAndRecordingToVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case GetUsersStatusToVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)

      //==================================================================
      // Send chat, presentation, and whiteboard in different channels so as not to
      // flood other applications (e.g. bbb-web) with unnecessary messages

      // Whiteboard
      case SendWhiteboardAnnotationEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsWbRedisChannel, json)
      case SendCursorPositionEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsWbRedisChannel, json)
      case ClearWhiteboardEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsWbRedisChannel, json)
      case UndoWhiteboardEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsWbRedisChannel, json)

      // Chat
      case SendPublicMessageEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsChatRedisChannel, json)
      case ClearPublicChatHistoryEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsChatRedisChannel, json)

      // Presentation
      case PresentationConversionCompletedEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case SetCurrentPageEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case ResizeAndMovePageEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case RemovePresentationEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case SetCurrentPresentationEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)

      // Breakout
      case UpdateBreakoutUsersEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case BreakoutRoomsListEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case BreakoutRoomJoinURLEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case BreakoutRoomsTimeRemainingUpdateEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case BreakoutRoomStartedEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case MeetingTimeRemainingUpdateEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      //==================================================================

      //==================================================================
      // Some events are only intended for recording and shouldn't be
      // sent past akka-apps
      // Poll Record Event
      case UserRespondedToPollRecordMsg.NAME =>
      //==================================================================

      case _ =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
    }
  }
}
