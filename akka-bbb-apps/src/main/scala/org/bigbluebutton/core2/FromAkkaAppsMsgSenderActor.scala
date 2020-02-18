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

    msg.envelope.name match {
      case SyncGetPresentationPodsRespMsg.NAME => msgSender.send(toHTML5RedisChannel, json)
      case SyncGetMeetingInfoRespMsg.NAME =>
        msgSender.send(toHTML5RedisChannel, json)
        msgSender.send("from-akka-apps-wb-redis-channel-sync", json)
      case SyncGetUsersMeetingRespMsg.NAME  => msgSender.send(toHTML5RedisChannel, json)
      case SyncGetGroupChatsRespMsg.NAME    => msgSender.send(toHTML5RedisChannel, json)
      case SyncGetGroupChatMsgsRespMsg.NAME => msgSender.send(toHTML5RedisChannel, json)
      case SyncGetVoiceUsersRespMsg.NAME    => msgSender.send(toHTML5RedisChannel, json)

      case MeetingCreatedEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-wb-redis-channel-sync", json)
      case MeetingEndingEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-wb-redis-channel-sync", json)
      case MeetingDestroyedEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-wb-redis-channel-sync", json)

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
        val whiteboardMeetingChannel = fromAkkaAppsWbRedisChannel + "-" + msg.envelope.routing("meetingId")
        msgSender.send(whiteboardMeetingChannel, json)
      case SendCursorPositionEvtMsg.NAME =>
        val cursorMeetingChannel = fromAkkaAppsWbRedisChannel + "-" + msg.envelope.routing("meetingId")
        msgSender.send(cursorMeetingChannel, json)
      case ClearWhiteboardEvtMsg.NAME =>
        val whiteboardMeetingChannel = fromAkkaAppsWbRedisChannel + "-" + msg.envelope.routing("meetingId")
        msgSender.send(whiteboardMeetingChannel, json)
      case UndoWhiteboardEvtMsg.NAME =>
        val whiteboardMeetingChannel = fromAkkaAppsWbRedisChannel + "-" + msg.envelope.routing("meetingId")
        msgSender.send(whiteboardMeetingChannel, json)

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
