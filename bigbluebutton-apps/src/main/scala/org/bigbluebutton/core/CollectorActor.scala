package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.api._
import com.google.gson.Gson

class CollectorActor(dispatcher: IDispatcher) extends Actor {

  def act() = {
    loop {
      react {
        //IN MESSAGES
        case msg: CreateMeeting                 => handleCreateMeeting(msg)
        case msg: InitializeMeeting             => handleInitializeMeeting(msg)
        case msg: DestroyMeeting                => handleDestroyMeeting(msg)
        case msg: StartMeeting                  => handleStartMeeting(msg)
        case msg: EndMeeting                    => handleEndMeeting(msg)
        case msg: LockSetting                   => handleLockSetting(msg)
        case msg: LockUser                      => handleLockUser(msg)
        case msg: LockAllUsers                  => handleLockAllUsers(msg)
        case msg: InitLockSettings              => handleInitLockSettings(msg)
        case msg: SetLockSettings               => handleSetLockSettings(msg)
        case msg: GetLockSettings               => handleGetLockSettings(msg)
        case msg: IsMeetingLocked               => handleIsMeetingLocked(msg)
        case msg: ValidateAuthToken             => handleValidateAuthToken(msg)
        case msg: RegisterUser                  => handleRegisterUser(msg)
        case msg: UserJoining                   => handleUserJoining(msg)
        case msg: UserLeaving                   => handleUserLeaving(msg)
        case msg: GetUsers                      => handleGetUsers(msg)
        case msg: UserRaiseHand                 => handleUserRaiseHand(msg)
        case msg: UserLowerHand                 => handleUserLowerHand(msg)
        case msg: UserShareWebcam               => handleUserShareWebcam(msg)
        case msg: UserUnshareWebcam             => handleUserUnshareWebcam(msg)
        case msg: ChangeUserStatus              => handleChangeUserStatus(msg)
        case msg: AssignPresenter               => handleAssignPresenter(msg)
        case msg: SetRecordingStatus            => handleSetRecordingStatus(msg)
        case msg: GetChatHistoryRequest         => handleGetChatHistoryRequest(msg)
        case msg: SendPublicMessageRequest      => handleSendPublicMessageRequest(msg)
        case msg: SendPrivateMessageRequest     => handleSendPrivateMessageRequest(msg)
        case msg: GetCurrentLayoutRequest       => handleGetCurrentLayoutRequest(msg)
        case msg: SetLayoutRequest              => handleSetLayoutRequest(msg)
        case msg: LockLayoutRequest             => handleLockLayoutRequest(msg)
        case msg: UnlockLayoutRequest           => handleUnlockLayoutRequest(msg)
        case msg: PreCreatedPoll                => handlePreCreatedPoll(msg)
        case msg: CreatePoll                    => handleCreatePoll(msg)
        case msg: UpdatePoll                    => handleUpdatePoll(msg)
        case msg: GetPolls                      => handleGetPolls(msg)
        case msg: DestroyPoll                   => handleDestroyPoll(msg)
        case msg: RemovePoll                    => handleRemovePoll(msg)
        case msg: SharePoll                     => handleSharePoll(msg)
        case msg: ShowPollResult                => handleShowPollResult(msg)
        case msg: HidePollResult                => handleHidePollResult(msg)
        case msg: StopPoll                      => handleStopPoll(msg)
        case msg: StartPoll                     => handleStartPoll(msg)
        case msg: ClearPoll                     => handleClearPoll(msg)
        case msg: GetPollResult                 => handleGetPollResult(msg)
        case msg: RespondToPoll                 => handleRespondToPoll(msg)
        case msg: ClearPresentation             => handleClearPresentation(msg)
        case msg: RemovePresentation            => handleRemovePresentation(msg)
        case msg: GetPresentationInfo           => handleGetPresentationInfo(msg)
        case msg: SendCursorUpdate              => handleSendCursorUpdate(msg)
        case msg: ResizeAndMoveSlide            => handleResizeAndMoveSlide(msg)
        case msg: GotoSlide                     => handleGotoSlide(msg)
        case msg: SharePresentation             => handleSharePresentation(msg)
        case msg: GetSlideInfo                  => handleGetSlideInfo(msg)
        case msg: PreuploadedPresentations      => handlePreuploadedPresentations(msg)
        case msg: PresentationConversionUpdate  => handlePresentationConversionUpdate(msg)
        case msg: PresentationPageCountError    => handlePresentationPageCountError(msg)
        case msg: PresentationSlideGenerated    => handlePresentationSlideGenerated(msg)
        case msg: PresentationConversionCompleted => handlePresentationConversionCompleted(msg)
        case msg: SendVoiceUsersRequest         => handleSendVoiceUsersRequest(msg)
        case msg: MuteMeetingRequest            => handleMuteMeetingRequest(msg)
        case msg: IsMeetingMutedRequest         => handleIsMeetingMutedRequest(msg)
        case msg: MuteUserRequest               => handleMuteUserRequest(msg)
        case msg: LockUserRequest               => handleLockUserRequest(msg)
        case msg: EjectUserRequest              => handleEjectUserRequest(msg)
        case msg: VoiceUserJoinedMessage        => handleVoiceUserJoinedMessage(msg)
        case msg: VoiceUserJoined               => handleVoiceUserJoined(msg)
        case msg: VoiceUserLeft                 => handleVoiceUserLeft(msg)
        case msg: VoiceUserLocked               => handleVoiceUserLocked(msg)
        case msg: VoiceUserMuted                => handleVoiceUserMuted(msg)
        case msg: VoiceUserTalking              => handleVoiceUserTalking(msg)
        case msg: VoiceRecording                => handleVoiceRecording(msg)
        case msg: SendWhiteboardAnnotationRequest => handleSendWhiteboardAnnotationRequest(msg)
        case msg: GetWhiteboardShapesRequest    => handleGetWhiteboardShapesRequest(msg)
        case msg: ClearWhiteboardRequest        => handleClearWhiteboardRequest(msg)
        case msg: UndoWhiteboardRequest         => handleUndoWhiteboardRequest(msg)
        case msg: EnableWhiteboardRequest       => handleEnableWhiteboardRequest(msg)
        case msg: IsWhiteboardEnabledRequest    => handleIsWhiteboardEnabledRequest(msg)

        //OUT MESSAGES
        case msg: MeetingCreated                => handleMeetingCreated(msg)
        case msg: VoiceRecordingStarted         => handleVoiceRecordingStarted(msg)
        case msg: VoiceRecordingStopped         => handleVoiceRecordingStopped(msg)
        case msg: RecordingStatusChanged        => handleRecordingStatusChanged(msg)
        case msg: GetRecordingStatusReply       => handleGetRecordingStatusReply(msg)
        case msg: MeetingEnded                  => handleMeetingEnded(msg)
        case msg: MeetingHasEnded               => handleMeetingHasEnded(msg)
        case msg: MeetingDestroyed              => handleMeetingDestroyed(msg)
        case msg: DisconnectAllUsers            => handleDisconnectAllUsers(msg)
        case msg: DisconnectUser                => handleDisconnectUser(msg)
        case msg: PermissionsSettingInitialized => handlePermissionsSettingInitialized(msg)
        case msg: NewPermissionsSetting         => handleNewPermissionsSetting(msg)
        case msg: UserLocked                    => handleUserLocked(msg)
        case msg: UsersLocked                   => handleUsersLocked(msg)
        case msg: GetPermissionsSettingReply    => handleGetPermissionsSettingReply(msg)
        case msg: IsMeetingLockedReply          => handleIsMeetingLockedReply(msg)
        case msg: UserRegistered                => handleUserRegistered(msg)
        case msg: UserLeft                      => handleUserLeft(msg)
        case msg: PresenterAssigned             => handlePresenterAssigned(msg)
        case msg: EndAndKickAll                 => handleEndAndKickAll(msg)
        case msg: GetUsersReply                 => handleGetUsersReply(msg)
        case msg: ValidateAuthTokenReply        => handleValidateAuthTokenReply(msg)
        case msg: UserJoined                    => handleUserJoined(msg)
        case msg: UserRaisedHand                => handleUserRaisedHand(msg)
        case msg: UserLoweredHand               => handleUserLoweredHand(msg)
        case msg: UserSharedWebcam              => handleUserSharedWebcam(msg)
        case msg: UserUnsharedWebcam            => handleUserUnsharedWebcam(msg)
        case msg: UserStatusChange              => handleUserStatusChange(msg)
        case msg: MuteVoiceUser                 => handleMuteVoiceUser(msg)
        case msg: UserVoiceMuted                => handleUserVoiceMuted(msg)
        case msg: UserVoiceTalking              => handleUserVoiceTalking(msg)
        case msg: EjectVoiceUser                => handleEjectVoiceUser(msg)
        case msg: UserJoinedVoice               => handleUserJoinedVoice(msg)
        case msg: UserLeftVoice                 => handleUserLeftVoice(msg)
        case msg: IsMeetingMutedReply           => handleIsMeetingMutedReply(msg)
        case msg: StartRecording                => handleStartRecording(msg)
        case msg: StopRecording                 => handleStopRecording(msg)
        case msg: GetChatHistoryReply           => handleGetChatHistoryReply(msg)
        case msg: SendPublicMessageEvent        => handleSendPublicMessageEvent(msg)
        case msg: SendPrivateMessageEvent       => handleSendPrivateMessageEvent(msg)
        case msg: GetCurrentLayoutReply         => handleGetCurrentLayoutReply(msg)
        case msg: SetLayoutEvent                => handleSetLayoutEvent(msg)
        case msg: LockLayoutEvent               => handleLockLayoutEvent(msg)
        case msg: UnlockLayoutEvent             => handleUnlockLayoutEvent(msg)
        case msg: GetPollResultReply            => handleGetPollResultReply(msg)
        case msg: GetPollsReplyOutMsg           => handleGetPollsReplyOutMsg(msg)
        case msg: ClearPollFailed               => handleClearPollFailed(msg)
        case msg: PollClearedOutMsg             => handlePollClearedOutMsg(msg)
        case msg: PollStartedOutMsg             => handlePollStartedOutMsg(msg)
        case msg: PollStoppedOutMsg             => handlePollStoppedOutMsg(msg)
        case msg: PollRemovedOutMsg             => handlePollRemovedOutMsg(msg)
        case msg: PollUpdatedOutMsg             => handlePollUpdatedOutMsg(msg)
        case msg: PollCreatedOutMsg             => handlePollCreatedOutMsg(msg)
        case msg: PollResponseOutMsg            => handlePollResponseOutMsg(msg)
        case msg: PollHideResultOutMsg          => handlePollHideResultOutMsg(msg)
        case msg: PollShowResultOutMsg          => handlePollShowResultOutMsg(msg)
        case msg: ClearPresentationOutMsg       => handleClearPresentationOutMsg(msg)
        case msg: RemovePresentationOutMsg      => handleRemovePresentationOutMsg(msg)
        case msg: GetPresentationInfoOutMsg     => handleGetPresentationInfoOutMsg(msg)
        case msg: SendCursorUpdateOutMsg        => handleSendCursorUpdateOutMsg(msg)
        case msg: ResizeAndMoveSlideOutMsg      => handleResizeAndMoveSlideOutMsg(msg)
        case msg: GotoSlideOutMsg               => handleGotoSlideOutMsg(msg)
        case msg: SharePresentationOutMsg       => handleSharePresentationOutMsg(msg)
        case msg: GetSlideInfoOutMsg            => handleGetSlideInfoOutMsg(msg)
        case msg: GetPreuploadedPresentationsOutMsg => handleGetPreuploadedPresentationsOutMsg(msg)
        case msg: PresentationConversionProgress => handlePresentationConversionProgress(msg)
        case msg: PresentationConversionError   => handlePresentationConversionError(msg)
        case msg: PresentationPageGenerated     => handlePresentationPageGenerated(msg)
        case msg: PresentationConversionDone    => handlePresentationConversionDone(msg)
        case msg: PresentationChanged           => handlePresentationChanged(msg)
        case msg: GetPresentationStatusReply    => handleGetPresentationStatusReply(msg)
        case msg: PresentationRemoved           => handlePresentationRemoved(msg)
        case msg: PageChanged                   => handlePageChanged(msg)
        case msg: GetWhiteboardShapesReply      => handleGetWhiteboardShapesReply(msg)
        case msg: SendWhiteboardAnnotationEvent => handleSendWhiteboardAnnotationEvent(msg)
        case msg: ClearWhiteboardEvent          => handleClearWhiteboardEvent(msg)
        case msg: UndoWhiteboardEvent           => handleUndoWhiteboardEvent(msg)
        case msg: WhiteboardEnabledEvent        => handleWhiteboardEnabledEvent(msg)
        case msg: IsWhiteboardEnabledReply      => handleIsWhiteboardEnabledReply(msg)

        case _ => // do nothing
      }
    }
  }

  // IN MESSAGES
  private def handleCreateMeeting(msg: CreateMeeting) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("recorded", msg.recorded)
    map.put("voiceBridge", msg.voiceBridge)
    map.put("duration", msg.duration)     
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING CREATE MEETING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleInitializeMeeting(msg: InitializeMeeting) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING INITIALIZE MEETING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleDestroyMeeting(msg: DestroyMeeting) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING DESTROY MEETING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleStartMeeting(msg: StartMeeting) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING START MEETING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleEndMeeting(msg: EndMeeting) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING END MEETING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleLockSetting(msg: LockSetting) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("locked", msg.locked)
    map.put("settings", msg.settings)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING LOCK SETTING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleLockUser(msg: LockUser) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("lock", msg.lock)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING LOCK USER *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleLockAllUsers(msg: LockAllUsers) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("lock", msg.lock)
    //map.put("exceptUsers", msg.exceptUsers) //#TODO
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING LOCK ALL USERS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleInitLockSettings(msg: InitLockSettings) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("locked", msg.locked)
    map.put("settings", msg.settings)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING INIT LOCK SETTINGS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSetLockSettings(msg: SetLockSettings) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("settings", msg.settings)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING SET LOCK SETTINGS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetLockSettings(msg: GetLockSettings) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING GET LOCK SETTINGS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleIsMeetingLocked(msg: IsMeetingLocked) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING IS MEETING LOCKED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleValidateAuthToken(msg: ValidateAuthToken) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("token", msg.token)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VALIDATE AUTH TOKEN *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleRegisterUser(msg: RegisterUser) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userID", msg.userID)
    map.put("name", msg.name)
    map.put("role", msg.role)
    map.put("extUserID", msg.extUserID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING REGISTER USER *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserJoining(msg: UserJoining) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userID", msg.userID)
    map.put("name", msg.name)
    map.put("role", msg.role)
    map.put("extUserID", msg.extUserID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING HANDLE USER JOINING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserLeaving(msg: UserLeaving) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userID", msg.userID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING HANDLE USER LEAVING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetUsers(msg: GetUsers) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING HANDLE GET USERS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserRaiseHand(msg: UserRaiseHand) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING USER RAISE HAND *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserLowerHand(msg: UserLowerHand) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("loweredBy", msg.loweredBy)
    map.put("timestamp", System.nanoTime())
  
    dispatcher.dispatch("***** DISPATCHING USER LOWER HAND *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserShareWebcam(msg: UserShareWebcam) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("stream", msg.stream)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING USER SHARE WEBCAM *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserUnshareWebcam(msg: UserUnshareWebcam) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
                 
    dispatcher.dispatch("***** DISPATCHING USER UNSHARE WEBCAM *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleChangeUserStatus(msg: ChangeUserStatus) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userID", msg.userID)
    map.put("status", msg.status)
    map.put("value", msg.value)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING CHANGE USER STATUS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleAssignPresenter(msg: AssignPresenter) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("newPresenterID", msg.newPresenterID)
    map.put("newPresenterName", msg.newPresenterName)
    map.put("assignedBy", msg.assignedBy)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING ASSIGN PRESENTER *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSetRecordingStatus(msg: SetRecordingStatus) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("recording", msg.recording)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SET RECORDING STATUS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET CHAT HISTORY REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SEND PUBLIC MESSAGE REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    //map.put("message", msg.message) //#TODO
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SEND PRIVATE MESSAGE REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET CURRENT LAYOUT REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSetLayoutRequest(msg: SetLayoutRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SET LAYOUT REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleLockLayoutRequest(msg: LockLayoutRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("layoutID", msg.layoutID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING LOCK LAYOUT REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUnlockLayoutRequest(msg: UnlockLayoutRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING UNLOCK LAYOUT REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePreCreatedPoll(msg: PreCreatedPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("poll", msg.poll)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING PRE CREATED POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleCreatePoll(msg: CreatePoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("poll", msg.poll)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING CREATE POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUpdatePoll(msg: UpdatePoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("poll", msg.poll)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING UPDATE POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPolls(msg: GetPolls) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET POLLS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleDestroyPoll(msg: DestroyPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING DESTROY POLLS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleRemovePoll(msg: RemovePoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING REMOVE POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSharePoll(msg: SharePoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SHARE POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleShowPollResult(msg: ShowPollResult) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SHOW POLL RESULTS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleHidePollResult(msg: HidePollResult) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING HIDE POLL RESULTS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleStopPoll(msg: StopPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING STOP POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleStartPoll(msg: StartPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING START POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearPoll(msg: ClearPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("force", msg.force)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING CLEAR POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPollResult(msg: GetPollResult) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET POLL RESULT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleRespondToPoll(msg: RespondToPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("response", msg.response)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING RESPOND TO POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearPresentation(msg: ClearPresentation) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING CLEAR PRESENTATION *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleRemovePresentation(msg: RemovePresentation) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("presentationID", msg.presentationID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING REMOVE PRESENTATION *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPresentationInfo(msg: GetPresentationInfo) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET PRESENTATION INFO *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendCursorUpdate(msg: SendCursorUpdate) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("xPercent", msg.xPercent)
    map.put("yPercent", msg.yPercent)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SEND CURSOR UPDATE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("xOffset", msg.xOffset)
    map.put("yOffset", msg.yOffset)
    map.put("widthRatio", msg.widthRatio)
    map.put("heightRatio", msg.heightRatio)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING RESIZE AND MOVE SLIDE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGotoSlide(msg: GotoSlide) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("page", msg.page)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GO TO SLIDE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSharePresentation(msg: SharePresentation) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("presentationID", msg.presentationID)
    map.put("share", msg.share)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SHARE PRESENTATION *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetSlideInfo(msg: GetSlideInfo) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET SLIDE INFO *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    //map.put("presentations", msg.presentations) //#TODO
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING PREUPLOADED PRESENTATIONS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentationId", msg.presentationId)
    map.put("presName", msg.presName)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING PRESENTATION CONVERSION UPDATE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationPageCountError(msg: PresentationPageCountError) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentationId", msg.presentationId)
    map.put("numberOfPages", msg.numberOfPages)
    map.put("maxNumberPages", msg.maxNumberPages)
    map.put("presName", msg.presName)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING PRESENTATION PAGE COUNT ERROR *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationSlideGenerated(msg: PresentationSlideGenerated) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentationId", msg.presentationId)
    map.put("numberOfPages", msg.numberOfPages)
    map.put("pagesCompleted", msg.pagesCompleted)
    map.put("presName", msg.presName)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING PRESENTATION SLIDE GENERATED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationConversionCompleted(msg: PresentationConversionCompleted) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentation", msg.presentation)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING PRESENTATION CONVERSION COMPLETED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendVoiceUsersRequest(msg: SendVoiceUsersRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SEND VOICE USERS REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("mute", msg.mute)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING MUTE MEETING REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING IS MEETING MUTED REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleMuteUserRequest(msg: MuteUserRequest) {
    var map = new java.util.HashMap[String, Any]()
    
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING MUTE USER REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleLockUserRequest(msg: LockUserRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("userID", msg.userID)
    map.put("lock", msg.lock)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING LOCK USER REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleEjectUserRequest(msg: EjectUserRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("userID", msg.userID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING EJECT USER REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceUserJoinedMessage(msg: VoiceUserJoinedMessage) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("user", msg.user)
    map.put("voiceConfId", msg.voiceConfId)
    map.put("callerIdNum", msg.callerIdNum)
    map.put("callerIdName", msg.callerIdName)
    map.put("muted", msg.muted)
    map.put("talking", msg.talking)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VOICE USER JOINED MESSAGE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceUserJoined(msg: VoiceUserJoined) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("voiceUser", msg.voiceUser)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VOICE USER JOINED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceUserLeft(msg: VoiceUserLeft) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING VOICE USER LEFT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceUserLocked(msg: VoiceUserLocked) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("locked", msg.locked)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VOICE USER LOCKED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceUserMuted(msg: VoiceUserMuted) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("muted", msg.muted)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VOICE USER MUTED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceUserTalking(msg: VoiceUserTalking) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("talking", msg.talking)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VOICE USER TALKING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceRecording(msg: VoiceRecording) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recordingFile", msg.recordingFile)
    map.put("timestamp", msg.timestamp)
    map.put("recording", msg.recording)
    map.put("timestamp-dispatching", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VOICE RECORDING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("annotation", msg.annotation)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SEND WHITEBOARD ANNOTATION REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetWhiteboardShapesRequest(msg: GetWhiteboardShapesRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("whiteboardId", msg.whiteboardId)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SEND WHITEBOARD SHAPES REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("whiteboardId", msg.whiteboardId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING CLEAR WHITEBOARD REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("whiteboardId", msg.whiteboardId)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING UNDO WHITEBOARD REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("enable", msg.enable)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING ENABLE WHITEBOARD REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING IS WHITEBOARD ENABLED REQUEST *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }



  // OUT MESSAGES
  private def handleMeetingCreated(msg: MeetingCreated) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("voiceBridge", msg.voiceBridge)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING MEETING CREATED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceRecordingStarted(msg: VoiceRecordingStarted) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("recordingFile", msg.recordingFile)
    map.put("timestamp", msg.timestamp)
    map.put("confNum", msg.confNum)
    map.put("timestamp-dispatching", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING VOICE RECORDING STARTED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleVoiceRecordingStopped(msg: VoiceRecordingStopped) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("recordingFile", msg.recordingFile)
    map.put("timestamp", msg.timestamp)
    map.put("confNum", msg.confNum)
    map.put("timestamp-dispatching", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING VOICE RECORDING STOPPED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("userId", msg.userId)
    map.put("recording", msg.recording)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING RECORDING STATUS CHANGED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("userId", msg.userId)
    map.put("recording", msg.recording)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET RECORDING STATUS REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleMeetingEnded(msg: MeetingEnded) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("voiceBridge", msg.voiceBridge)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING MEETING ENDED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING MEETING HAS ENDED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleMeetingDestroyed(msg: MeetingDestroyed) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING MEETING DESTROYED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING DISCONNECT ALL USERS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleDisconnectUser(msg: DisconnectUser) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING DISCONNECT USER *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePermissionsSettingInitialized(msg: PermissionsSettingInitialized) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("locked", msg.locked)
    map.put("settings", msg.settings)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PERMISSIONS SETTING INIIALIZED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("settings", msg.settings)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING NEW PERMISSIONS SETTING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserLocked(msg: UserLocked) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("lock", msg.lock)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER LOCKED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUsersLocked(msg: UsersLocked) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("lock", msg.lock)
    //map.put("exceptUsers", msg.exceptUsers) //#TODO
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USERS LOCKED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPermissionsSettingReply(msg: GetPermissionsSettingReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET PERMISSIONS SETTING REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleIsMeetingLockedReply(msg: IsMeetingLockedReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING IS MEETING LOCKED REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserRegistered(msg: UserRegistered) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("user", msg.user)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER REGISTERED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserLeft(msg: UserLeft) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("user", msg.user)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING USER LEFT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresenterAssigned(msg: PresenterAssigned) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("presenter", msg.presenter)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PRESENTER ASSIGNED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleEndAndKickAll(msg: EndAndKickAll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING END AND KICK ALL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetUsersReply(msg: GetUsersReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterID", msg.requesterID)
    //map.put("users", msg.users) //#TODO
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET USERS REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("requesterId", msg.requesterId)
    map.put("token", msg.token)
    map.put("valid", msg.valid)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING VALIDATE AUTH TOKEN REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserJoined(msg: UserJoined) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("user", msg.user)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER JOINED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserRaisedHand(msg: UserRaisedHand) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("userID", msg.userID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING USER RAISED HAND *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserLoweredHand(msg: UserLoweredHand) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("loweredBy", msg.loweredBy)
    map.put("userID", msg.userID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER LOWERED HAND *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("userID", msg.userID)
    map.put("stream", msg.stream)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER SHARED WEBCAM *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("userID", msg.userID)
    map.put("stream", msg.stream)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING USER UNSHARED WEBCAM *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserStatusChange(msg: UserStatusChange) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("userID", msg.userID)
    map.put("status", msg.status)
    map.put("value", msg.value)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER STATUS CHANGE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("userId", msg.userId)
    map.put("mute", msg.mute)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING MUTE VOICE USER *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserVoiceMuted(msg: UserVoiceMuted) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("confNum", msg.confNum)
    map.put("user", msg.user)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING USER VOICE MUTED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserVoiceTalking(msg: UserVoiceTalking) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("confNum", msg.confNum)
    map.put("user", msg.user)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER VOICE TALKING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("userId", msg.userId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING EJECT VOICE USER *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("confNum", msg.confNum)
    map.put("user", msg.user)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING USER JOINED VOICE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUserLeftVoice(msg: UserLeftVoice) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("confNum", msg.confNum)
    map.put("user", msg.user)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING USER LEFT VOICE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("meetingMuted", msg.meetingMuted)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING IS MEETING MUTED REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleStartRecording(msg: StartRecording) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING START RECORDING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleStopRecording(msg: StopRecording) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING STOP RECORDING *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetChatHistoryReply(msg: GetChatHistoryReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    //map.put("history", msg.history) //#TODO
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET CHAT HISTORY REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    //map.put("message", msg.message) //#TODO
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SEND PUBLIC MESSAGE EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendPrivateMessageEvent(msg: SendPrivateMessageEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    //map.put("message", msg.message) //#TODO
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SEND PRIVATE MESSAGE EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetCurrentLayoutReply(msg: GetCurrentLayoutReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("layoutID", msg.layoutID)
    map.put("locked", msg.locked)
    map.put("setByUserID", msg.setByUserID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET CURRENT LAYOUT REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSetLayoutEvent(msg: SetLayoutEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("layoutID", msg.layoutID)
    map.put("locked", msg.locked)
    map.put("setByUserID", msg.setByUserID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING SET LAYOUT EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleLockLayoutEvent(msg: LockLayoutEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("layoutID", msg.layoutID)
    map.put("locked", msg.locked)
    map.put("setByUserID", msg.setByUserID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING LOCK LAYOUT EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUnlockLayoutEvent(msg: UnlockLayoutEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("layoutID", msg.layoutID)
    map.put("locked", msg.locked)
    map.put("setByUserID", msg.setByUserID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING UNLOCK LAYOUT EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPollResultReply(msg: GetPollResultReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("pollVO", msg.pollVO)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET POLL RESULT REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPollsReplyOutMsg(msg: GetPollsReplyOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    //map.put("polls", msg.polls) //#TODO
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET POLLS REPLY OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearPollFailed(msg: ClearPollFailed) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("pollID", msg.pollID)
    map.put("requesterID", msg.requesterID)
    map.put("reason", msg.reason)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING CLEAR POLL FAILED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollClearedOutMsg(msg: PollClearedOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("pollID", msg.pollID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING POLL CLEARED OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollStartedOutMsg(msg: PollStartedOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("pollID", msg.pollID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING POLL STARTED OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollStoppedOutMsg(msg: PollStoppedOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("pollID", msg.pollID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING POLL STOPPED OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollRemovedOutMsg(msg: PollRemovedOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("pollID", msg.pollID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING POLL REMOVED OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollUpdatedOutMsg(msg: PollUpdatedOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("pollID", msg.pollID)
    map.put("pollVO", msg.pollVO)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING POLL UPDATED OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollCreatedOutMsg(msg: PollCreatedOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("pollID", msg.pollID)
    map.put("pollVO", msg.pollVO)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING POLL CREATED OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollResponseOutMsg(msg: PollResponseOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("responder", msg.responder)
    map.put("response", msg.response)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING POLL RESPONSE OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollHideResultOutMsg(msg: PollHideResultOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING POLL HIDE RESULT OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePollShowResultOutMsg(msg: PollShowResultOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("pollID", msg.pollID)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING POLL SHOW RESULT OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING CLEAR PRESENTATION OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("presentationID", msg.presentationID)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING REMOVE PRESENTATION OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPresentationInfoOutMsg(msg: GetPresentationInfoOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("info", msg.info)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET PRESENTATION INFO OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("xPercent", msg.xPercent)
    map.put("yPercent", msg.yPercent)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SEND CURSOR UPDATE OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("page", msg.page)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING RESIZE AND MOVE SLIDE OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("page", msg.page)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GO TO SLIDE OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("presentation", msg.presentation)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SHARE PRESENTATION OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetSlideInfoOutMsg(msg: GetSlideInfoOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("page", msg.page)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET SLIDE INFO OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPreuploadedPresentationsOutMsg(msg: GetPreuploadedPresentationsOutMsg) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET PREUPLOADED PRESENTATIONS OUTMSG *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationConversionProgress(msg: PresentationConversionProgress) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentationId", msg.presentationId)
    map.put("presentationName", msg.presentationName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PRESENTATION CONVERSION PROGRESS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationConversionError(msg: PresentationConversionError) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentationId", msg.presentationId)
    map.put("presentationName", msg.presentationName)
    map.put("numberOfPages", msg.numberOfPages)
    map.put("maxNumberPages", msg.maxNumberPages)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PRESENTATION CONVERSION ERROR *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationPageGenerated(msg: PresentationPageGenerated) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentationId", msg.presentationId)
    map.put("presentationName", msg.presentationName)
    map.put("numberOfPages", msg.numberOfPages)
    map.put("pagesCompleted", msg.pagesCompleted)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING PRESENTATION PAGE GENERATED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationConversionDone(msg: PresentationConversionDone) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("messageKey", msg.messageKey)
    map.put("code", msg.code)
    map.put("presentation", msg.presentation)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PRESENTATION CONVERSION DONE *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationChanged(msg: PresentationChanged) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("presentation", msg.presentation)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PRESENTATION CHANGED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPresentationStatusReply(msg: GetPresentationStatusReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    //map.put("presentations", msg.presentations) //#TODO
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET PRESENTATION STATUS REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePresentationRemoved(msg: PresentationRemoved) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("presentationId", msg.presentationId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PRESENTATION REMOVED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handlePageChanged(msg: PageChanged) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("page", msg.page)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING PAGE CHANGED *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetWhiteboardShapesReply(msg: GetWhiteboardShapesReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("whiteboardId", msg.whiteboardId)
    //map.put("shapes", msg.shapes) //#TODO
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING GET WHITEBOARD SHAPES REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("whiteboardId", msg.whiteboardId)
    map.put("shape", msg.shape)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SEND WHITEBOARD ANNOTATION EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("whiteboardId", msg.whiteboardId)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING CLEAR WHITEBOARD EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("whiteboardId", msg.whiteboardId)
    map.put("shapeId", msg.shapeId)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING UNDO WHITEBOARD EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleWhiteboardEnabledEvent(msg: WhiteboardEnabledEvent) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("enable", msg.enable)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING WHITEBOARD ENABLED EVENT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
 private def handleIsWhiteboardEnabledReply(msg: IsWhiteboardEnabledReply) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("recorded", msg.recorded)
    map.put("requesterID", msg.requesterID)
    map.put("enabled", msg.enabled)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING IS WHITEBOARD ENABLED REPLY *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
}

// IN MESSAGES

/*
CreateMeeting
InitializeMeeting
DestroyMeeting
StartMeeting
EndMeeting
LockSetting
LockUser
LockAllUsers
InitLockSettings
SetLockSettings
GetLockSettings
IsMeetingLocked
ValidateAuthToken
RegisterUser
UserJoining
UserLeaving
GetUsers
UserRaiseHand
UserLowerHand
UserShareWebcam
UserUnshareWebcam
ChangeUserStatus
AssignPresenter
SetRecordingStatus
GetRecordingStatus
GetChatHistoryRequest
SendPublicMessageRequest
SendPrivateMessageRequest
GetCurrentLayoutRequest
SetLayoutRequest
LockLayoutRequest
UnlockLayoutRequest
PreCreatedPoll
CreatePoll
UpdatePoll
GetPolls
DestroyPoll
RemovePoll
SharePoll
ShowPollResult
HidePollResult
StopPoll
StartPoll
ClearPoll
GetPollResult
RespondToPoll
ClearPresentation
RemovePresentation
GetPresentationInfo
SendCursorUpdate
ResizeAndMoveSlide
GotoSlide
SharePresentation
GetSlideInfo
PreuploadedPresentations
PresentationConversionUpdate
PresentationPageCountError
PresentationSlideGenerated
PresentationConversionCompleted
SendVoiceUsersRequest
MuteMeetingRequest
IsMeetingMutedRequest
MuteUserRequest
LockUserRequest
EjectUserRequest
VoiceUserJoinedMessage
VoiceUserJoined
VoiceUserLeft
VoiceUserLocked
VoiceUserMuted
VoiceUserTalking
VoiceRecording
SendWhiteboardAnnotationRequest
GetWhiteboardShapesRequest
ClearWhiteboardRequest
UndoWhiteboardRequest
EnableWhiteboardRequest
IsWhiteboardEnabledRequest
*/

// OUT MESSAGES

/*
VoiceRecordingStarted
VoiceRecordingStopped
RecordingStatusChanged
GetRecordingStatusReply
MeetingCreated
MeetingEnded
MeetingHasEnded
MeetingDestroyed
DisconnectAllUsers
DisconnectUser
PermissionsSettingInitialized
NewPermissionsSetting
UserLocked
UsersLocked
GetPermissionsSettingReply
IsMeetingLockedReply
UserRegistered
UserLeft
PresenterAssigned
EndAndKickAll
GetUsersReply
ValidateAuthTokenReply
UserJoined
UserRaisedHand
UserLoweredHand
UserSharedWebcam
UserUnsharedWebcam
UserStatusChange
MuteVoiceUser
UserVoiceMuted
UserVoiceTalking
EjectVoiceUser
UserJoinedVoice
UserLeftVoice
IsMeetingMutedReply
StartRecording
StopRecording
GetChatHistoryReply
SendPublicMessageEvent
SendPrivateMessageEvent
GetCurrentLayoutReply
SetLayoutEvent
LockLayoutEvent
UnlockLayoutEvent
GetPollResultReply
GetPollsReplyOutMsg
ClearPollFailed
PollClearedOutMsg
PollStartedOutMsg
PollStoppedOutMsg
PollRemovedOutMsg
PollUpdatedOutMsg
PollCreatedOutMsg
PollResponseOutMsg
PollHideResultOutMsg
PollShowResultOutMsg
ClearPresentationOutMsg
RemovePresentationOutMsg
GetPresentationInfoOutMsg
SendCursorUpdateOutMsg
ResizeAndMoveSlideOutMsg
GotoSlideOutMsg
SharePresentationOutMsg
GetSlideInfoOutMsg
GetPreuploadedPresentationsOutMsg
PresentationConversionProgress
PresentationConversionError
PresentationPageGenerated
PresentationConversionDone
PresentationChanged
GetPresentationStatusReply
PresentationRemoved
PageChanged
GetWhiteboardShapesReply
SendWhiteboardAnnotationEvent
ClearWhiteboardEvent
UndoWhiteboardEvent
WhiteboardEnabledEvent
IsWhiteboardEnabledReply
*/