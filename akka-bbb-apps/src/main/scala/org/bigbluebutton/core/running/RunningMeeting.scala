package org.bigbluebutton.core.running

import akka.actor.ActorContext
import org.bigbluebutton.common2.domain.{ DefaultProps }
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core2.MeetingStatus2x

object RunningMeeting {
  def apply(props: DefaultProps, outGW: OutMessageGateway,
    eventBus: IncomingEventBus)(implicit context: ActorContext) =
    new RunningMeeting(props, outGW, eventBus)(context)
}

class RunningMeeting(val props: DefaultProps, val outGW: OutMessageGateway,
    val eventBus: IncomingEventBus)(implicit val context: ActorContext) {

  val chatModel = new ChatModel()
  val layoutModel = new LayoutModel()
  val pollModel = new PollModel()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val breakoutRooms = new BreakoutRooms()
  val captionModel = new CaptionModel()
  val notesModel = new SharedNotesModel()
  val users = new Users
  val registeredUsers = new RegisteredUsers
  val meetingStatux2x = new MeetingStatus2x
  val webcams = new Webcams
  val voiceUsers = new VoiceUsers
  val users2x = new Users2x
  val usersState = new UsersState
  val polls2x = new Polls
  val guestsWaiting = new GuestsWaiting

  // meetingModel.setGuestPolicy(props.usersProp.guestPolicy)

  // We extract the meeting handlers into this class so it is
  // easy to test.
  val liveMeeting = new LiveMeeting(props, meetingStatux2x, chatModel, layoutModel,
    users, registeredUsers, polls2x, pollModel, wbModel, presModel, breakoutRooms, captionModel,
    notesModel, webcams, voiceUsers, users2x, guestsWaiting)

  val actorRef = context.actorOf(MeetingActor.props(props, eventBus, outGW, liveMeeting), props.meetingProp.intId)

}
