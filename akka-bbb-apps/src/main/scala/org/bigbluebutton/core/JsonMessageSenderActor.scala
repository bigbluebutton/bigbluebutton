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
import org.bigbluebutton.common.messages._
import org.bigbluebutton.core.pubsub.senders.WhiteboardMessageToJsonConverter
import org.bigbluebutton.common.converters.ToJsonEncoder
import org.bigbluebutton.common.messages.payload._
import org.bigbluebutton.common.messages._
import org.bigbluebutton.messages.payload._
import org.bigbluebutton.messages._

object JsonMessageSenderActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[JsonMessageSenderActor], msgSender)
}

class JsonMessageSenderActor(val service: MessageSender)
    extends Actor with ActorLogging {

  def receive = {

    // Breakout
    case msg: CreateBreakoutRoom => handleCreateBreakoutRoom(msg)
    case msg: EndBreakoutRoom => handleEndBreakoutRoom(msg)
    case msg: BreakoutRoomsListOutMessage => handleBreakoutRoomsList(msg)
    case msg: BreakoutRoomJoinURLOutMessage => handleBreakoutRoomJoinURL(msg)
    case msg: BreakoutRoomStartedOutMessage => handleBreakoutRoomStarted(msg)
    case msg: BreakoutRoomEndedOutMessage => handleBreakoutRoomEnded(msg)
    case msg: UpdateBreakoutUsersOutMessage => handleUpdateBreakoutUsers(msg)
    case msg: MeetingTimeRemainingUpdate => handleMeetingTimeRemainingUpdate(msg)

    case _ => // do nothing
  }

  // Breakout
  private def handleBreakoutRoomStarted(msg: BreakoutRoomStartedOutMessage) {
    val payload = new BreakoutRoomPayload(msg.parentMeetingId, msg.breakout.meetingId, msg.breakout.externalMeetingId, msg.breakout.name, msg.breakout.sequence)
    val request = new BreakoutRoomStarted(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }

  private def handleBreakoutRoomEnded(msg: BreakoutRoomEndedOutMessage) {
    val payload = new BreakoutRoomPayload(msg.parentMeetingId, msg.meetingId, "", "", 0)
    val request = new BreakoutRoomClosed(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }

  private def handleUpdateBreakoutUsers(msg: UpdateBreakoutUsersOutMessage) {
    val users = new java.util.ArrayList[BreakoutUserPayload]()
    msg.users.foreach(x => users.add(new BreakoutUserPayload(x.id, x.name)))
    val payload = new UpdateBreakoutUsersPayload(msg.parentMeetingId, msg.breakoutMeetingId, users)
    val request = new UpdateBreakoutUsers(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleMeetingTimeRemainingUpdate(msg: MeetingTimeRemainingUpdate) {
    val payload = new MeetingTimeRemainingPayload(msg.meetingId, msg.timeRemaining)
    val request = new TimeRemainingUpdate(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleMeetingTimeRemainingUpdate(msg: BreakoutRoomsTimeRemainingUpdateOutMessage) {
    val payload = new BreakoutRoomsTimeRemainingPayload(msg.meetingId, msg.timeRemaining)
    val request = new BreakoutRoomsTimeRemainingUpdate(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleBreakoutRoomsList(msg: BreakoutRoomsListOutMessage) {
    val rooms = new java.util.ArrayList[BreakoutRoomPayload]()
    msg.rooms.foreach(r => rooms.add(new BreakoutRoomPayload(msg.meetingId, r.meetingId, r.externalMeetingId, r.name, r.sequence)))
    val payload = new BreakoutRoomsListPayload(msg.meetingId, rooms, msg.roomsReady)
    val request = new BreakoutRoomsList(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleCreateBreakoutRoom(msg: CreateBreakoutRoom) {
    val payload = new CreateBreakoutRoomRequestPayload(msg.room.breakoutMeetingId, msg.room.parentId, msg.room.name,
      msg.room.sequence, msg.room.voiceConfId, msg.room.viewerPassword, msg.room.moderatorPassword,
      msg.room.durationInMinutes, msg.room.sourcePresentationId, msg.room.sourcePresentationSlide, msg.room.record)
    val request = new CreateBreakoutRoomRequest(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleEndBreakoutRoom(msg: EndBreakoutRoom) {
    val payload = new EndBreakoutRoomRequestPayload(msg.breakoutMeetingId)
    val request = new EndBreakoutRoomRequest(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  def handleBreakoutRoomJoinURL(msg: BreakoutRoomJoinURLOutMessage) {
    val payload = new BreakoutRoomJoinURLPayload(msg.parentMeetingId,
      msg.breakoutMeetingId, msg.userId, msg.redirectJoinURL, msg.noRedirectJoinURL)
    val request = new BreakoutRoomJoinURL(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }
}
