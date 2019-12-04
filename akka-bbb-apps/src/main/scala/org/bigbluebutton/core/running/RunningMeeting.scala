package org.bigbluebutton.core.running

import akka.actor.ActorContext
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core2.MeetingStatus2x

object RunningMeeting {
  def apply(props: DefaultProps, outGW: OutMessageGateway,
            eventBus: InternalEventBus)(implicit context: ActorContext) =
    new RunningMeeting(props, outGW, eventBus)(context)
}

class RunningMeeting(val props: DefaultProps, outGW: OutMessageGateway,
                     eventBus: InternalEventBus)(implicit val context: ActorContext) {

  private val chatModel = new ChatModel()
  private val layouts = new Layouts()
  private val wbModel = new WhiteboardModel()
  private val presModel = new PresentationModel()
  private val captionModel = new CaptionModel()
  private val notesModel = new SharedNotesModel()
  private val registeredUsers = new RegisteredUsers
  private val meetingStatux2x = new MeetingStatus2x
  private val webcams = new Webcams
  private val voiceUsers = new VoiceUsers
  private val users2x = new Users2x
  private val polls2x = new Polls
  private val guestsWaiting = new GuestsWaiting
  private val deskshareModel = new ScreenshareModel

  // meetingModel.setGuestPolicy(props.usersProp.guestPolicy)

  // We extract the meeting handlers into this class so it is
  // easy to test.
  private val liveMeeting = new LiveMeeting(props, meetingStatux2x, deskshareModel, chatModel, layouts,
    registeredUsers, polls2x, wbModel, presModel, captionModel,
    notesModel, webcams, voiceUsers, users2x, guestsWaiting)

  GuestsWaiting.setGuestPolicy(
    liveMeeting.guestsWaiting,
    GuestPolicy(props.usersProp.guestPolicy, SystemUser.ID)
  )

  private val recordEvents = props.recordProp.record || props.recordProp.keepEvents
  val outMsgRouter = new OutMsgRouter(recordEvents, outGW)

  val actorRef = context.actorOf(MeetingActor.props(props, eventBus, outMsgRouter, liveMeeting), props.meetingProp.intId)

}
