package org.bigbluebutton.core.running

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.{ MeetingModel, MeetingProperties, OutMessageGateway }

object RunningMeeting {
  def apply(mProps: MeetingProperties, outGW: OutMessageGateway,
    eventBus: IncomingEventBus)(implicit context: ActorContext) =
    new RunningMeeting(mProps, outGW, eventBus)(context)
}

class RunningMeeting(val mProps: MeetingProperties, val outGW: OutMessageGateway,
    val eventBus: IncomingEventBus)(implicit val context: ActorContext) {

  val chatModel = new ChatModel()
  val layoutModel = new LayoutModel()
  val meetingModel = new MeetingModel()
  val usersModel = new UsersModel()
  val pollModel = new PollModel()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val breakoutModel = new BreakoutRoomModel()
  val captionModel = new CaptionModel()
  val notesModel = new SharedNotesModel()

  meetingModel.setGuestPolicy(mProps.guestPolicy)

  // We extract the meeting handlers into this class so it is
  // easy to test.
  val liveMeeting = new LiveMeeting(mProps, eventBus, outGW,
    chatModel, layoutModel, meetingModel, usersModel, pollModel,
    wbModel, presModel, breakoutModel, captionModel, notesModel)

  val actorRef = context.actorOf(MeetingActor.props(mProps, eventBus, outGW, liveMeeting), mProps.meetingID)

}