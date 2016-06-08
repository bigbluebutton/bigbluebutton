package org.bigbluebutton.core

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.domain.{ MeetingExtensionStatus, MeetingProperties2x }
import org.bigbluebutton.core.models.{ BreakoutRoomModel, CaptionModel, _ }

object RunningMeeting {
  def apply(mProps: MeetingProperties2x, outGW: OutMessageGateway,
    eventBus: IncomingEventBus)(implicit context: ActorContext) =
    new RunningMeeting(mProps, outGW, eventBus)(context)
}

class RunningMeeting(val mProps: MeetingProperties2x, val outGW: OutMessageGateway,
    val eventBus: IncomingEventBus)(implicit val context: ActorContext) {

  val abilities: MeetingPermissions = new MeetingPermissions
  val registeredUsers = new RegisteredUsers2x
  val users = new Users3x
  val chats = new ChatModel
  val layouts = new LayoutModel
  val polls = new PollModel
  val whiteboards = new WhiteboardModel
  val presentations = new PresentationModel
  val breakoutRooms = new BreakoutRoomModel
  val captions = new CaptionModel
  val extension: MeetingExtensionStatus = new MeetingExtensionStatus

  val state: MeetingStateModel = new MeetingStateModel(mProps,
    abilities,
    registeredUsers,
    users,
    chats,
    layouts,
    polls,
    whiteboards,
    presentations,
    breakoutRooms,
    captions,
    new MeetingStatus)

  val actorRef = context.actorOf(MeetingActor2x.props(mProps, eventBus, outGW, state), mProps.id.value)

}