package org.bigbluebutton.core.running

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

  private val chatModel = new ChatModel()
  private val layoutModel = new LayoutModel()
  private val meetingModel = new MeetingModel()
  private val usersModel = new UsersModel()
  private val pollModel = new PollModel()
  private val wbModel = new WhiteboardModel()
  private val presModel = new PresentationModel()
  private val breakoutModel = new BreakoutRoomModel()
  private val captionModel = new CaptionModel()

  val state: MeetingStateModel = new MeetingStateModel(mProps, chatModel, layoutModel, meetingModel, usersModel, pollModel,
    wbModel, presModel, breakoutModel, captionModel)

  val actorRef = context.actorOf(MeetingActor.props(eventBus, outGW, state), mProps.meetingID)

}