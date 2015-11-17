package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.pubsub.senders.ChatMessageToJsonConverter
import org.bigbluebutton.common.messages.StartRecordingVoiceConfRequestMessage
import org.bigbluebutton.common.messages.StopRecordingVoiceConfRequestMessage
import org.bigbluebutton.core.pubsub.senders.MeetingMessageToJsonConverter
import org.bigbluebutton.core.pubsub.senders.PesentationMessageToJsonConverter
import org.bigbluebutton.common.messages.GetPresentationInfoReplyMessage
import org.bigbluebutton.common.messages.PresentationRemovedMessage
import org.bigbluebutton.core.apps.Page
import collection.JavaConverters._
import scala.collection.JavaConversions._
import org.bigbluebutton.core.apps.SimplePollResultOutVO
import org.bigbluebutton.core.apps.SimplePollOutVO
import org.bigbluebutton.core.pubsub.senders.UsersMessageToJsonConverter
import org.bigbluebutton.common.messages.GetUsersFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.MuteUserInVoiceConfRequestMessage
import org.bigbluebutton.common.messages.EjectUserFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.GetCurrentLayoutReplyMessage
import org.bigbluebutton.common.messages.BroadcastLayoutMessage
import org.bigbluebutton.common.messages.LockLayoutMessage
import org.bigbluebutton.core.pubsub.senders.WhiteboardMessageToJsonConverter
import org.bigbluebutton.common.converters.ToJsonEncoder
import org.bigbluebutton.messages.payload.BreakoutRoomPayload
import org.bigbluebutton.messages.BreakoutRoomStarted
import org.bigbluebutton.messages.payload.CreateBreakoutRoomRequestPayload
import org.bigbluebutton.messages.CreateBreakoutRoomRequest
import org.bigbluebutton.messages.payload.BreakoutRoomJoinURLPayload
import org.bigbluebutton.messages.BreakoutRoomJoinURL
import org.bigbluebutton.messages.payload.UpdateBreakoutUsersPayload
import org.bigbluebutton.messages.payload.BreakoutUserPayload
import org.bigbluebutton.messages.UpdateBreakoutUsers
import org.bigbluebutton.messages.payload.MeetingTimeRemainingPayload
import org.bigbluebutton.messages.TimeRemainingUpdate

object JsonMessageSenderActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[JsonMessageSenderActor], msgSender)
}

class JsonMessageSenderActor(val service: MessageSender)
    extends Actor with ActorLogging {

  def receive = {

    // Breakout
    case msg: CreateBreakoutRoom => handleCreateBreakoutRoom(msg)
    case msg: BreakoutRoomJoinURLOutMessage => handleBreakoutRoomJoinURL(msg)
    case msg: BreakoutRoomStartedOutMessage => handleBreakoutRoomStarted(msg)
    case msg: UpdateBreakoutUsersOutMessage => handleUpdateBreakoutUsers(msg)
    case msg: MeetingTimeRemainingUpdate => handleMeetingTimeRemainingUpdate(msg)

    case _ => // do nothing
  }

  // Breakout
  private def handleBreakoutRoomStarted(msg: BreakoutRoomStartedOutMessage) {
    val payload = new BreakoutRoomPayload(msg.breakout.breakoutId, msg.breakout.name)
    val request = new BreakoutRoomStarted(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }

  private def handleUpdateBreakoutUsers(msg: UpdateBreakoutUsersOutMessage) {
    val users = new java.util.ArrayList[BreakoutUserPayload]()
    msg.users.foreach(x => users.add(new BreakoutUserPayload(x.id, x.name)))
    val payload = new UpdateBreakoutUsersPayload(msg.meetingId, msg.breakoutId, users)
    val request = new UpdateBreakoutUsers(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleMeetingTimeRemainingUpdate(msg: MeetingTimeRemainingUpdate) {
    val payload = new MeetingTimeRemainingPayload(msg.meetingId, msg.timeRemaining)
    val request = new TimeRemainingUpdate(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleCreateBreakoutRoom(msg: CreateBreakoutRoom) {
    val payload = new CreateBreakoutRoomRequestPayload(msg.room.breakoutId, msg.room.parentId, msg.room.name,
      msg.room.voiceConfId, msg.room.viewerPassword, msg.room.moderatorPassword,
      msg.room.durationInMinutes, msg.room.defaultPresentationURL)
    val request = new CreateBreakoutRoomRequest(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  def handleBreakoutRoomJoinURL(msg: BreakoutRoomJoinURLOutMessage) {
    val payload = new BreakoutRoomJoinURLPayload(msg.meetingId,
      msg.breakoutId, msg.userId, msg.joinURL)
    val request = new BreakoutRoomJoinURL(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }
}
