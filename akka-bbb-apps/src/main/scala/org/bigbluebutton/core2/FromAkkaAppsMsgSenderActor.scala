package org.bigbluebutton.core2

import org.apache.pekko.actor.{ Actor, ActorLogging, Props }
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

      // Sent to FreeSWITCH
      case EjectAllFromVoiceConfMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case GetUsersInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case EjectUserFromVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case MuteUserInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case DeafUserInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case HoldUserInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case PlaySoundInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)
      case StopSoundInVoiceConfSysMsg.NAME =>
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
      case HoldChannelInVoiceConfSysMsg.NAME =>
        msgSender.send(toVoiceConfRedisChannel, json)

      // Sent to SFU
      case EjectUserFromSfuSysMsg.NAME =>
        msgSender.send(toSfuRedisChannel, json)
      case CamBroadcastStopSysMsg.NAME =>
        msgSender.send(toSfuRedisChannel, json)
      case CamStreamUnsubscribeSysMsg.NAME =>
        msgSender.send(toSfuRedisChannel, json)
      case ToggleListenOnlyModeSysMsg.NAME =>
        msgSender.send(toSfuRedisChannel, json)
      case GenerateLiveKitTokenReqMsg.NAME =>
        msgSender.send(toSfuRedisChannel, json)

      //==================================================================
      // Send chat, presentation, and whiteboard in different channels so as not to
      // flood other applications (e.g. bbb-web) with unnecessary messages

      // Whiteboard
      case SendWhiteboardAnnotationsEvtMsg.NAME =>
        msgSender.send("from-akka-apps-frontend-redis-channel", json)
      case SendCursorPositionEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
      case ClearWhiteboardEvtMsg.NAME =>
        msgSender.send("from-akka-apps-frontend-redis-channel", json)
      case DeleteWhiteboardAnnotationsEvtMsg.NAME =>
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

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
        msgSender.send(fromAkkaAppsRedisChannel, json)
      case SetPageInfiniteWhiteboardEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case ResizeAndMovePageEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case RemovePresentationEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case SetCurrentPresentationEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)

      // Breakout
      case BreakoutRoomsListEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      case BreakoutRoomStartedEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsPresRedisChannel, json)
      //==================================================================

      //==================================================================
      // Some events are only intended for recording and shouldn't be
      // sent past akka-apps
      // Poll Record Event
      case UserRespondedToPollRecordMsg.NAME =>
      //==================================================================

      // Message duplicated for frontend and backend processes
      case MeetingCreatedEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case MeetingEndingEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case MeetingDestroyedEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case UserLeftMeetingEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case UserLeftVoiceConfToClientEvtMsg.NAME =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case UpdateExternalVideoEvtMsg.NAME =>
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case NotifyAllInMeetingEvtMsg.NAME =>
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case NotifyUserInMeetingEvtMsg.NAME =>
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case NotifyRoleInMeetingEvtMsg.NAME =>
        msgSender.send("from-akka-apps-frontend-redis-channel", json)

      case _ =>
        msgSender.send(fromAkkaAppsRedisChannel, json)
    }
  }
}
