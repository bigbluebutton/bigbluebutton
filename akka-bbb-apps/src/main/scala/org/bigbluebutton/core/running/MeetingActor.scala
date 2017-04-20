package org.bigbluebutton.core.running

import java.io.{ PrintWriter, StringWriter }
import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import org.bigbluebutton.core._
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.bus._
import scala.concurrent.duration._

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
