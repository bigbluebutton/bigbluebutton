package org.bigbluebutton.core.running

import org.apache.pekko.actor.ActorContext
import org.bigbluebutton.ClientSettings
import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.common2
import org.bigbluebutton.common2.util.YamlUtil

import scala.util.{ Failure, Success }

object RunningMeeting {
  def apply(props: DefaultProps, outGW: OutMessageGateway,
            eventBus: InternalEventBus)(implicit context: ActorContext) =
    new RunningMeeting(props, outGW, eventBus)(context)
}

class RunningMeeting(val props: DefaultProps, outGW: OutMessageGateway,
                     eventBus: InternalEventBus)(implicit val context: ActorContext) {

  private val externalVideoModel = new ExternalVideoModel()
  private val chatModel = new ChatModel()
  private val layouts = new Layouts()
  private val pads = new Pads()
  private val wbModel = new WhiteboardModel()
  private val presModel = new PresentationModel()
  private val captionModel = new CaptionModel()
  private val registeredUsers = new RegisteredUsers
  private val meetingStatux2x = new MeetingStatus2x
  private val webcams = new Webcams
  private val voiceUsers = new VoiceUsers
  private val users2x = new Users2x
  private val polls2x = new Polls
  private val guestsWaiting = new GuestsWaiting
  private val deskshareModel = new ScreenshareModel
  private val audioCaptions = new AudioCaptions
  private val timerModel = new TimerModel

  val clientSettingsFromFile = ClientSettings.clientSettingsFromFile

  private val clientSettings: Map[String, Object] = if (props.overrideClientSettings != null
    && props.overrideClientSettings.nonEmpty) {
    val scalaMapClientOverride = common2.util.JsonUtil.toMap[Object](props.overrideClientSettings)
    scalaMapClientOverride match {
      case Success(value) => YamlUtil.mergeImmutableMaps(clientSettingsFromFile, value)
      case Failure(_) =>
        println("No valid JSON override of client configuration in create call")
        clientSettingsFromFile
    }
  } else clientSettingsFromFile

  // meetingModel.setGuestPolicy(props.usersProp.guestPolicy)

  // We extract the meeting handlers into this class so it is
  // easy to test.
  private val liveMeeting = new LiveMeeting(props, meetingStatux2x, deskshareModel, audioCaptions, timerModel,
    chatModel, externalVideoModel, layouts, pads, registeredUsers, polls2x, wbModel, presModel, captionModel,
    webcams, voiceUsers, users2x, guestsWaiting, clientSettings)

  GuestsWaiting.setGuestPolicy(
    liveMeeting.props.meetingProp.intId,
    liveMeeting.guestsWaiting,
    GuestPolicy(props.usersProp.guestPolicy, SystemUser.ID)
  )

  Layouts.setCurrentLayout(
    liveMeeting.layouts,
    props.usersProp.meetingLayout,
  )

  private val recordEvents = props.recordProp.record || props.recordProp.keepEvents
  val outMsgRouter = new OutMsgRouter(recordEvents, outGW)

  val actorRef = context.actorOf(MeetingActor.props(props, eventBus, outMsgRouter, liveMeeting), props.meetingProp.intId)

}
