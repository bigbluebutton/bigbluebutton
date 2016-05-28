package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
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
    val payload = new BreakoutRoomPayload(msg.meetingId.value, msg.breakout.breakoutId.value,
      msg.breakout.name)
    val request = new BreakoutRoomStarted(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }

  private def handleBreakoutRoomEnded(msg: BreakoutRoomEndedOutMessage) {
    val payload = new BreakoutRoomPayload(msg.meetingId.value, msg.breakoutId.value, "")
    val request = new BreakoutRoomClosed(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }

  private def handleUpdateBreakoutUsers(msg: UpdateBreakoutUsersOutMessage) {
    val users = new java.util.ArrayList[BreakoutUserPayload]()
    msg.users.foreach(x => users.add(new BreakoutUserPayload(x.id, x.name)))
    val payload = new UpdateBreakoutUsersPayload(msg.meetingId.value, msg.breakoutId.value, users)
    val request = new UpdateBreakoutUsers(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleMeetingTimeRemainingUpdate(msg: MeetingTimeRemainingUpdate) {
    val payload = new MeetingTimeRemainingPayload(msg.meetingId.value, msg.timeRemaining)
    val request = new TimeRemainingUpdate(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleMeetingTimeRemainingUpdate(msg: BreakoutRoomsTimeRemainingUpdateOutMessage) {
    // TODO: handleMeetingTimeRemainingUpdate
    //    val payload = new BreakoutRoomsTimeRemainingPayload(msg.meetingId.value, msg.timeRemaining)
    //    val request = new BreakoutRoomsTimeRemainingUpdate(payload)
    //    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleBreakoutRoomsList(msg: BreakoutRoomsListOutMessage) {
    val rooms = new java.util.ArrayList[BreakoutRoomPayload]()
    msg.rooms.foreach(r => rooms.add(new BreakoutRoomPayload(msg.meetingId.value, r.breakoutId.value, r.name)))
    val payload = new BreakoutRoomsListPayload(msg.meetingId.value, rooms)
    val request = new BreakoutRoomsList(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleCreateBreakoutRoom(msg: CreateBreakoutRoom) {
    val payload = new CreateBreakoutRoomRequestPayload(msg.room.breakoutId.value,
      msg.room.parentId.value, msg.room.name.value,
      msg.room.voiceConfId.value, msg.room.viewerPassword, msg.room.moderatorPassword,
      msg.room.durationInMinutes, msg.room.defaultPresentationURL)
    val request = new CreateBreakoutRoomRequest(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  private def handleEndBreakoutRoom(msg: EndBreakoutRoom) {
    val payload = new EndBreakoutRoomRequestPayload(msg.breakoutId.value)
    val request = new EndBreakoutRoomRequest(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson())
  }

  def handleBreakoutRoomJoinURL(msg: BreakoutRoomJoinURLOutMessage) {
    val payload = new BreakoutRoomJoinURLPayload(msg.meetingId.value,
      msg.breakoutId.value, msg.userId.value, msg.joinURL)
    val request = new BreakoutRoomJoinURL(payload)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, request.toJson)
  }
}
