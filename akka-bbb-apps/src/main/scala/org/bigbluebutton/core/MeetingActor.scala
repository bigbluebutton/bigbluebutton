package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import java.io.{ PrintWriter, StringWriter }
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.api._
import java.util.concurrent.TimeUnit
import org.bigbluebutton.core.util._
import scala.concurrent.duration._
import org.bigbluebutton.core.apps.{ PollApp, UsersApp, PresentationApp, LayoutApp, ChatApp, WhiteboardApp, CaptionApp, SharedNotesApp }
import org.bigbluebutton.core.apps.{ ChatModel, LayoutModel, UsersModel, PollModel, WhiteboardModel, CaptionModel, SharedNotesModel }
import org.bigbluebutton.core.apps.PresentationModel
import org.bigbluebutton.core.apps.BreakoutRoomApp
import org.bigbluebutton.core.apps.BreakoutRoomModel

object MeetingActorInternal {
  def props(mProps: MeetingProperties,
    eventBus: IncomingEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[MeetingActorInternal], mProps, eventBus, outGW)
}

// This actor is an internal audit actor for each meeting actor that
// periodically sends messages to the meeting actor
class MeetingActorInternal(val mProps: MeetingProperties,
  val eventBus: IncomingEventBus, val outGW: OutMessageGateway)
    extends Actor with ActorLogging with SystemConfiguration {

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on MeetingActorInternal, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  private def getInactivityDeadline(): Int = {
    val time = getMetadata(Metadata.INACTIVITY_DEADLINE, mProps.metadata) match {
      case Some(result) => result.asInstanceOf[Int]
      case None => inactivityDeadline
    }
    log.debug("InactivityDeadline: {} seconds", time)
    time
  }

  private def getInactivityTimeLeft(): Int = {
    val time = getMetadata(Metadata.INACTIVITY_TIMELEFT, mProps.metadata) match {
      case Some(result) => result.asInstanceOf[Int]
      case None => inactivityTimeLeft
    }
    log.debug("InactivityTimeLeft: {} seconds", time)
    time
  }

  private val InactivityDeadline = FiniteDuration(getInactivityDeadline(), "seconds")
  private val InactivityTimeLeft = FiniteDuration(getInactivityTimeLeft(), "seconds")
  private val MonitorFrequency = 10 seconds
  private var deadline = InactivityDeadline.fromNow
  private var inactivityWarning: Deadline = null

  import context.dispatcher
  context.system.scheduler.schedule(5 seconds, MonitorFrequency, self, "Monitor")

  // Query to get voice conference users
  outGW.send(new GetUsersInVoiceConference(mProps.meetingID, mProps.recorded, mProps.voiceBridge))

  if (mProps.isBreakout) {
    // This is a breakout room. Inform our parent meeting that we have been successfully created.
    eventBus.publish(BigBlueButtonEvent(
      mProps.parentMeetingID,
      BreakoutRoomCreated(mProps.parentMeetingID, mProps.meetingID)))
  }

  def receive = {
    case "Monitor" => handleMonitor()
    case msg: Object => handleMessage(msg)
  }

  def handleMonitor() {
    handleMonitorActivity()
    handleMonitorNumberOfWebUsers()
  }

  def handleMessage(msg: Object) {
    if (isMeetingActivity(msg)) {
      notifyActivity()
    }
  }

  def handleMonitorNumberOfWebUsers() {
    eventBus.publish(BigBlueButtonEvent(mProps.meetingID, MonitorNumberOfUsers(mProps.meetingID)))

    // Trigger updating users of time remaining on meeting.
    eventBus.publish(BigBlueButtonEvent(mProps.meetingID, SendTimeRemainingUpdate(mProps.meetingID)))

    if (mProps.isBreakout) {
      // This is a breakout room. Update the main meeting with list of users in this breakout room.
      eventBus.publish(BigBlueButtonEvent(mProps.meetingID, SendBreakoutUsersUpdate(mProps.meetingID)))
    }

  }

  private def handleMonitorActivity() {
    if (deadline.isOverdue() && inactivityWarning != null && inactivityWarning.isOverdue()) {
      log.info("Closing meeting {} due to inactivity for {} seconds", mProps.meetingID, InactivityDeadline.toSeconds)
      updateInactivityMonitors()
      eventBus.publish(BigBlueButtonEvent(mProps.meetingID, EndMeeting(mProps.meetingID)))
      // Or else make sure to send only one warning message
    } else if (deadline.isOverdue() && inactivityWarning == null) {
      log.info("Sending inactivity warning to meeting {}", mProps.meetingID)
      outGW.send(new InactivityWarning(mProps.meetingID, InactivityTimeLeft.toSeconds))
      // We add 5 seconds so clients will have enough time to process the message
      inactivityWarning = (InactivityTimeLeft + (5 seconds)).fromNow
    }
  }

  private def updateInactivityMonitors() {
    deadline = InactivityDeadline.fromNow
    inactivityWarning = null
  }

  private def notifyActivity() {
    if (inactivityWarning != null) {
      outGW.send(new MeetingIsActive(mProps.meetingID))
    }

    updateInactivityMonitors()
  }

  private def handleActivityResponse(msg: ActivityResponse) {
    log.info("User endorsed that meeting {} is active", mProps.meetingID)
    updateInactivityMonitors()
    outGW.send(new MeetingIsActive(mProps.meetingID))
  }

  private def isMeetingActivity(msg: Object): Boolean = {
    // We need to avoid all internal system's messages
    msg match {
      case msg: MonitorNumberOfUsers => false
      case msg: SendTimeRemainingUpdate => false
      case msg: SendBreakoutUsersUpdate => false
      case msg: BreakoutRoomCreated => false
      case _ => true
    }
  }

  def getMetadata(key: String, metadata: java.util.Map[String, String]): Option[Object] = {
    var value: Option[String] = None
    if (metadata.containsKey(key)) {
      value = Some(metadata.get(key))
    }

    value match {
      case Some(v) => {
        key match {
          case Metadata.INACTIVITY_DEADLINE => {
            // Can be defined between 1 minute to 6 hours
            metadataIntegerValueOf(v, 60, 21600) match {
              case Some(r) => Some(r.asInstanceOf[Object])
              case None => None
            }
          }
          case Metadata.INACTIVITY_TIMELEFT => {
            // Can be defined between 30 seconds to 30 minutes
            metadataIntegerValueOf(v, 30, 1800) match {
              case Some(r) => Some(r.asInstanceOf[Object])
              case None => None
            }
          }
          case _ => None
        }
      }
      case None => None
    }
  }

  private def metadataIntegerValueOf(value: String, lowerBound: Int, upperBound: Int): Option[Int] = {
    stringToInt(value) match {
      case Some(r) => {
        if (lowerBound <= r && r <= upperBound) {
          Some(r)
        } else {
          None
        }
      }
      case None => None
    }
  }

  private def stringToInt(value: String): Option[Int] = {
    var result: Option[Int] = None
    try {
      result = Some(Integer.parseInt(value))
    } catch {
      case e: Exception => {
        result = None
      }
    }
    result
  }
}

object MeetingActor {
  def props(mProps: MeetingProperties,
    eventBus: IncomingEventBus,
    outGW: OutMessageGateway): Props =
    Props(classOf[MeetingActor], mProps, eventBus, outGW)
}

class MeetingActor(val mProps: MeetingProperties,
  val eventBus: IncomingEventBus,
  val outGW: OutMessageGateway)
    extends Actor with ActorLogging {

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on MeetingActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

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

  /**
   * Put the internal message injector into another actor so this
   * actor is easy to test.
   */
  var actorMonitor = context.actorOf(MeetingActorInternal.props(mProps, eventBus, outGW), "actorMonitor-" + mProps.meetingID)

  /** Subscribe to meeting and voice events. **/
  eventBus.subscribe(actorMonitor, mProps.meetingID)
  eventBus.subscribe(actorMonitor, mProps.voiceBridge)
  eventBus.subscribe(actorMonitor, mProps.deskshareBridge)

  def receive = {
    case msg: ActivityResponse => liveMeeting.handleActivityResponse(msg)
    case msg: MonitorNumberOfUsers => liveMeeting.handleMonitorNumberOfWebUsers(msg)
    case msg: ValidateAuthToken => liveMeeting.handleValidateAuthToken(msg)
    case msg: RegisterUser => liveMeeting.handleRegisterUser(msg)
    case msg: UserJoinedVoiceConfMessage => liveMeeting.handleUserJoinedVoiceConfMessage(msg)
    case msg: UserLeftVoiceConfMessage => liveMeeting.handleUserLeftVoiceConfMessage(msg)
    case msg: UserMutedInVoiceConfMessage => liveMeeting.handleUserMutedInVoiceConfMessage(msg)
    case msg: UserTalkingInVoiceConfMessage => liveMeeting.handleUserTalkingInVoiceConfMessage(msg)
    case msg: VoiceConfRecordingStartedMessage => liveMeeting.handleVoiceConfRecordingStartedMessage(msg)
    case msg: UserJoining => liveMeeting.handleUserJoin(msg)
    case msg: UserLeaving => liveMeeting.handleUserLeft(msg)
    case msg: AssignPresenter => liveMeeting.handleAssignPresenter(msg)
    case msg: AllowUserToShareDesktop => liveMeeting.handleAllowUserToShareDesktop(msg)
    case msg: GetUsers => liveMeeting.handleGetUsers(msg)
    case msg: ChangeUserStatus => liveMeeting.handleChangeUserStatus(msg)
    case msg: EjectUserFromMeeting => liveMeeting.handleEjectUserFromMeeting(msg)
    case msg: UserEmojiStatus => liveMeeting.handleUserEmojiStatus(msg)
    case msg: UserShareWebcam => liveMeeting.handleUserShareWebcam(msg)
    case msg: UserUnshareWebcam => liveMeeting.handleUserunshareWebcam(msg)
    case msg: MuteMeetingRequest => liveMeeting.handleMuteMeetingRequest(msg)
    case msg: MuteAllExceptPresenterRequest => liveMeeting.handleMuteAllExceptPresenterRequest(msg)
    case msg: IsMeetingMutedRequest => liveMeeting.handleIsMeetingMutedRequest(msg)
    case msg: MuteUserRequest => liveMeeting.handleMuteUserRequest(msg)
    case msg: EjectUserFromVoiceRequest => liveMeeting.handleEjectUserRequest(msg)
    case msg: TransferUserToMeetingRequest => liveMeeting.handleTransferUserToMeeting(msg)
    case msg: SetLockSettings => liveMeeting.handleSetLockSettings(msg)
    case msg: GetLockSettings => liveMeeting.handleGetLockSettings(msg)
    case msg: LockUserRequest => liveMeeting.handleLockUserRequest(msg)
    case msg: InitLockSettings => liveMeeting.handleInitLockSettings(msg)
    case msg: InitAudioSettings => liveMeeting.handleInitAudioSettings(msg)
    case msg: GetChatHistoryRequest => liveMeeting.handleGetChatHistoryRequest(msg)
    case msg: SendPublicMessageRequest => liveMeeting.handleSendPublicMessageRequest(msg)
    case msg: SendPrivateMessageRequest => liveMeeting.handleSendPrivateMessageRequest(msg)
    case msg: UserConnectedToGlobalAudio => liveMeeting.handleUserConnectedToGlobalAudio(msg)
    case msg: UserDisconnectedFromGlobalAudio => liveMeeting.handleUserDisconnectedFromGlobalAudio(msg)
    case msg: GetCurrentLayoutRequest => liveMeeting.handleGetCurrentLayoutRequest(msg)
    case msg: BroadcastLayoutRequest => liveMeeting.handleBroadcastLayoutRequest(msg)
    case msg: InitializeMeeting => liveMeeting.handleInitializeMeeting(msg)
    case msg: ClearPresentation => liveMeeting.handleClearPresentation(msg)
    case msg: PresentationConversionUpdate => liveMeeting.handlePresentationConversionUpdate(msg)
    case msg: PresentationPageCountError => liveMeeting.handlePresentationPageCountError(msg)
    case msg: PresentationSlideGenerated => liveMeeting.handlePresentationSlideGenerated(msg)
    case msg: PresentationConversionCompleted => liveMeeting.handlePresentationConversionCompleted(msg)
    case msg: RemovePresentation => liveMeeting.handleRemovePresentation(msg)
    case msg: GetPresentationInfo => liveMeeting.handleGetPresentationInfo(msg)
    case msg: SendCursorUpdate => liveMeeting.handleSendCursorUpdate(msg)
    case msg: ResizeAndMoveSlide => liveMeeting.handleResizeAndMoveSlide(msg)
    case msg: GotoSlide => liveMeeting.handleGotoSlide(msg)
    case msg: SharePresentation => liveMeeting.handleSharePresentation(msg)
    case msg: GetSlideInfo => liveMeeting.handleGetSlideInfo(msg)
    case msg: PreuploadedPresentations => liveMeeting.handlePreuploadedPresentations(msg)
    case msg: SendWhiteboardAnnotationRequest => liveMeeting.handleSendWhiteboardAnnotationRequest(msg)
    case msg: GetWhiteboardShapesRequest => liveMeeting.handleGetWhiteboardShapesRequest(msg)
    case msg: ClearWhiteboardRequest => liveMeeting.handleClearWhiteboardRequest(msg)
    case msg: UndoWhiteboardRequest => liveMeeting.handleUndoWhiteboardRequest(msg)
    case msg: EnableWhiteboardRequest => liveMeeting.handleEnableWhiteboardRequest(msg)
    case msg: IsWhiteboardEnabledRequest => liveMeeting.handleIsWhiteboardEnabledRequest(msg)
    case msg: SetRecordingStatus => liveMeeting.handleSetRecordingStatus(msg)
    case msg: GetRecordingStatus => liveMeeting.handleGetRecordingStatus(msg)
    case msg: StartCustomPollRequest => liveMeeting.handleStartCustomPollRequest(msg)
    case msg: StartPollRequest => liveMeeting.handleStartPollRequest(msg)
    case msg: StopPollRequest => liveMeeting.handleStopPollRequest(msg)
    case msg: ShowPollResultRequest => liveMeeting.handleShowPollResultRequest(msg)
    case msg: HidePollResultRequest => liveMeeting.handleHidePollResultRequest(msg)
    case msg: RespondToPollRequest => liveMeeting.handleRespondToPollRequest(msg)
    case msg: GetPollRequest => liveMeeting.handleGetPollRequest(msg)
    case msg: GetCurrentPollRequest => liveMeeting.handleGetCurrentPollRequest(msg)
    case msg: ChangeUserRole => liveMeeting.handleChangeUserRole(msg)
    case msg: LogoutEndMeeting => liveMeeting.handleLogoutEndMeeting(msg)
    case msg: ClearPublicChatHistoryRequest => liveMeeting.handleClearPublicChatHistoryRequest(msg)

    // Breakout rooms
    case msg: BreakoutRoomsListMessage => liveMeeting.handleBreakoutRoomsList(msg)
    case msg: CreateBreakoutRooms => liveMeeting.handleCreateBreakoutRooms(msg)
    case msg: BreakoutRoomCreated => liveMeeting.handleBreakoutRoomCreated(msg)
    case msg: BreakoutRoomEnded => liveMeeting.handleBreakoutRoomEnded(msg)
    case msg: RequestBreakoutJoinURLInMessage => liveMeeting.handleRequestBreakoutJoinURL(msg)
    case msg: BreakoutRoomUsersUpdate => liveMeeting.handleBreakoutRoomUsersUpdate(msg)
    case msg: SendBreakoutUsersUpdate => liveMeeting.handleSendBreakoutUsersUpdate(msg)
    case msg: EndAllBreakoutRooms => liveMeeting.handleEndAllBreakoutRooms(msg)

    case msg: ExtendMeetingDuration => liveMeeting.handleExtendMeetingDuration(msg)
    case msg: SendTimeRemainingUpdate => liveMeeting.handleSendTimeRemainingUpdate(msg)
    case msg: EndMeeting => liveMeeting.handleEndMeeting(msg)

    // Closed Caption
    case msg: SendCaptionHistoryRequest => liveMeeting.handleSendCaptionHistoryRequest(msg)
    case msg: UpdateCaptionOwnerRequest => liveMeeting.handleUpdateCaptionOwnerRequest(msg)
    case msg: EditCaptionHistoryRequest => liveMeeting.handleEditCaptionHistoryRequest(msg)

    case msg: DeskShareStartedRequest => liveMeeting.handleDeskShareStartedRequest(msg)
    case msg: DeskShareStoppedRequest => liveMeeting.handleDeskShareStoppedRequest(msg)
    case msg: DeskShareRTMPBroadcastStartedRequest => liveMeeting.handleDeskShareRTMPBroadcastStartedRequest(msg)
    case msg: DeskShareRTMPBroadcastStoppedRequest => liveMeeting.handleDeskShareRTMPBroadcastStoppedRequest(msg)
    case msg: DeskShareGetDeskShareInfoRequest => liveMeeting.handleDeskShareGetDeskShareInfoRequest(msg)

    // Guest
    case msg: GetGuestPolicy => liveMeeting.handleGetGuestPolicy(msg)
    case msg: SetGuestPolicy => liveMeeting.handleSetGuestPolicy(msg)
    case msg: RespondToGuest => liveMeeting.handleRespondToGuest(msg)

    // Shared Notes
    case msg: PatchDocumentRequest => liveMeeting.handlePatchDocumentRequest(msg)
    case msg: GetCurrentDocumentRequest => liveMeeting.handleGetCurrentDocumentRequest(msg)
    case msg: CreateAdditionalNotesRequest => liveMeeting.handleCreateAdditionalNotesRequest(msg)
    case msg: DestroyAdditionalNotesRequest => liveMeeting.handleDestroyAdditionalNotesRequest(msg)
    case msg: RequestAdditionalNotesSetRequest => liveMeeting.handleRequestAdditionalNotesSetRequest(msg)
    case msg: SharedNotesSyncNoteRequest => liveMeeting.handleSharedNotesSyncNoteRequest(msg)

    case _ => // do nothing
  }

}
