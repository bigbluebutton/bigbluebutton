package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.api._
import com.google.gson.Gson
import scala.collection.mutable.HashMap
import collection.JavaConverters._
import scala.collection.JavaConversions._
import java.util.ArrayList
import org.bigbluebutton.core.apps.poll.PollVO
import org.bigbluebutton.core.apps.presentation.Page
import org.bigbluebutton.core.apps.presentation.Presentation
import org.bigbluebutton.core.apps.chat.redis.ChatMessageToJsonConverter
import org.bigbluebutton.core.apps.presentation.redis.PesentationMessageToJsonConverter
import org.bigbluebutton.core.apps.whiteboard.redis.WhiteboardMessageToJsonConverter
import org.bigbluebutton.core.meeting.MeetingMessageToJsonConverter
import org.bigbluebutton.core.apps.users.redis.UsersMessageToJsonConverter

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
        case msg: BroadcastLayoutRequest        => handleBroadcastLayoutRequest(msg)
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
        //case msg: SendCursorUpdate              => handleSendCursorUpdate(msg)
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
        case msg: EjectUserFromVoiceRequest     => handleEjectUserFromVoiceRequest(msg)
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
        case msg: BroadcastLayoutEvent          => handleBroadcastLayoutEvent(msg)
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
        //case msg: SendCursorUpdateOutMsg        => handleSendCursorUpdateOutMsg(msg)
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

  private def buildUserHashMap(user: UserVO):java.util.HashMap[String, Object] = {
	val vu = user.voiceUser
	val vuser = new java.util.HashMap[String, Object]()
	vuser.put(Constants.USER_ID, vu.userId)
	vuser.put(Constants.WEB_USER_ID, vu.webUserId)
	vuser.put(Constants.CALLER_ID_NAME, vu.callerName)
	vuser.put(Constants.CALLER_ID_NUM, vu.callerNum)
	vuser.put(Constants.JOINED, vu.joined:java.lang.Boolean)
	vuser.put(Constants.LOCKED, vu.locked:java.lang.Boolean)
	vuser.put(Constants.MUTED, vu.muted:java.lang.Boolean)
	vuser.put(Constants.TALKING, vu.talking:java.lang.Boolean)
	
	val wuser = new java.util.HashMap[String, Object]()
	wuser.put(Constants.USER_ID, user.userID)
	wuser.put(Constants.EXT_USER_ID, user.externUserID)
	wuser.put(Constants.NAME, user.name)
	wuser.put(Constants.ROLE, user.role.toString())
	wuser.put(Constants.RAISE_HAND, user.raiseHand:java.lang.Boolean)
	wuser.put(Constants.PRESENTER, user.presenter:java.lang.Boolean)
	wuser.put(Constants.HAS_STREAM, user.hasStream:java.lang.Boolean)
	wuser.put(Constants.LOCKED, user.locked:java.lang.Boolean)
	wuser.put(Constants.WEBCAM_STREAM, user.webcamStream)
	wuser.put(Constants.PHONE_USER, user.phoneUser:java.lang.Boolean)
	wuser.put(Constants.VOICE_USER, vuser)	  
	  
	wuser
  }
  	
  private def buildJson(header: java.util.HashMap[String, Any], 
      payload: java.util.HashMap[String, Any]): String = {
    
    val message = new java.util.HashMap[String, java.util.HashMap[String, Any]]()
    message.put(Constants.HEADER, header)
    message.put(Constants.PAYLOAD, payload)
    
    val gson = new Gson()
    gson.toJson(message)
  }
  
  // IN MESSAGES
  private def handleCreateMeeting(msg: CreateMeeting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)    
    payload.put(Constants.MEETING_NAME, msg.meetingName)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.VOICE_CONF, msg.voiceBridge)
    payload.put(Constants.DURATION, msg.duration)     
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.CREATE_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING CREATE MEETING *****************")
    
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleInitializeMeeting(msg: InitializeMeeting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.INITIALIZE_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING INITIALIZE MEETING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleDestroyMeeting(msg: DestroyMeeting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.DESTROY_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING DESTROY MEETING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleStartMeeting(msg: StartMeeting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.START_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING START MEETING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleEndMeeting(msg: EndMeeting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.END_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING END MEETING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleLockSetting(msg: LockSetting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.LOCKED, msg.locked)

    val settingsMap = new java.util.HashMap[String, Boolean]()
    for ((key, value) <- msg.settings) {
      settingsMap.put(key, value)
    }
    
    payload.put("settings", settingsMap) //#todo not tested
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.END_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING LOCK SETTING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleLockUser(msg: LockUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.LOCK, msg.lock)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.END_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING LOCK USER *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleLockAllUsers(msg: LockAllUsers) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.EXCEPT_USERS, msg.exceptUsers.toString())
    payload.put(Constants.LOCK, msg.lock)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.END_MEETING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)    
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING LOCK ALL USERS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleInitLockSettings(msg: InitLockSettings) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.SETTINGS, msg.settings.toString())
    payload.put(Constants.LOCKED, msg.locked)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.INIT_LOCK_SETTINGS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)    
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING INIT LOCK SETTINGS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSetLockSettings(msg: SetLockSettings) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.SETTINGS, msg.settings.toString())
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SET_LOCK_SETTINGS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)      
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SET LOCK SETTINGS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetLockSettings(msg: GetLockSettings) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_LOCK_SETTINGS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)    
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
      
//    println("***** DISPATCHING GET LOCK SETTINGS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleIsMeetingLocked(msg: IsMeetingLocked) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.IS_MEETING_LOCKED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)     
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING IS MEETING LOCKED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleValidateAuthToken(msg: ValidateAuthToken) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.AUTH_TOKEN, msg.token)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VALIDATE_AUTH_TOKEN)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VALIDATE AUTH TOKEN *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleRegisterUser(msg: RegisterUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.NAME, msg.name)
    payload.put(Constants.ROLE, msg.role.toString())
    payload.put(Constants.EXT_USER_ID, msg.extUserID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.REGISTER_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)    
    
//    println("***** DISPATCHING REGISTER USER *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserJoining(msg: UserJoining) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_JOINING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING HANDLE USER JOINING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLeaving(msg: UserLeaving) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_LEAVING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING HANDLE USER LEAVING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetUsers(msg: GetUsers) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_USERS)
    
    /**
     * Let's temporarily have this convention as correlationId
     */
    val replyTo = msg.meetingID + "/" + msg.requesterID
    header.put(Constants.REPLY_TO, replyTo)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING HANDLE GET USERS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserRaiseHand(msg: UserRaiseHand) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.RAISE_HAND)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER RAISE HAND *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLowerHand(msg: UserLowerHand) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.LOWERED_BY, msg.loweredBy)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.LOWER_HAND)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER LOWER HAND *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserShareWebcam(msg: UserShareWebcam) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.STREAM, msg.stream)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_SHARE_WEBCAM)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)    
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER SHARE WEBCAM *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserUnshareWebcam(msg: UserUnshareWebcam) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_UNSHARE_WEBCAM)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)   
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER UNSHARE WEBCAM *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleChangeUserStatus(msg: ChangeUserStatus) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STATUS, msg.status)
    payload.put(Constants.VALUE, msg.value)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.CHANGE_USER_STATUS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)      
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING CHANGE USER STATUS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleAssignPresenter(msg: AssignPresenter) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.NEW_PRESENTER_ID, msg.newPresenterID)
    payload.put(Constants.NEW_PRESENTER_NAME, msg.newPresenterName)
    payload.put(Constants.ASSIGNED_BY, msg.assignedBy)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.ASSIGN_PRESENTER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)     
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING ASSIGN PRESENTER *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSetRecordingStatus(msg: SetRecordingStatus) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SET_RECORDING_STATUS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)     
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SET RECORDING STATUS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetChatHistoryRequest(msg: GetChatHistoryRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_CHAT_HISTORY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)  
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET CHAT HISTORY REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSendPublicMessageRequest(msg: SendPublicMessageRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val messageMap = new java.util.HashMap[String, String]()
    for ((key, value) <- msg.message) {
      messageMap.put(key, value)
    }
    payload.put("message", messageMap)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SEND_PUBLIC_MESSAGE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)     
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SEND PUBLIC MESSAGE REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSendPrivateMessageRequest(msg: SendPrivateMessageRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val messageMap = new java.util.HashMap[String, String]()
    for ((key, value) <- msg.message) {
      messageMap.put(key, value)
    }
    payload.put("message", messageMap)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SEND_PRIVATE_CHAT_MESSAGE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)  
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SEND PRIVATE MESSAGE REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_CURRENT_LAYOUT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)  
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET CURRENT LAYOUT REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleBroadcastLayoutRequest(msg: BroadcastLayoutRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.LAYOUT, msg.layout)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.BROADCAST_LAYOUT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleLockLayoutRequest(msg: LockLayoutRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.setById)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.UNLOCK_LAYOUT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePreCreatedPoll(msg: PreCreatedPoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL, msg.poll)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PRECREATED_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PRE CREATED POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleCreatePoll(msg: CreatePoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL, msg.poll)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.CREATE_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING CREATE POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUpdatePoll(msg: UpdatePoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL, msg.poll)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.UPDATE_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING UPDATE POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetPolls(msg: GetPolls) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_POLLS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET POLLS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleDestroyPoll(msg: DestroyPoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.DESTROY_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING DESTROY POLLS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleRemovePoll(msg: RemovePoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.REMOVE_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING REMOVE POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSharePoll(msg: SharePoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SHARE_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SHARE POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleShowPollResult(msg: ShowPollResult) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SHOW_POLL_RESULT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SHOW POLL RESULTS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleHidePollResult(msg: HidePollResult) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.HIDE_POLL_RESULT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING HIDE POLL RESULTS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleStopPoll(msg: StopPoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.STOP_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING STOP POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleStartPoll(msg: StartPoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.START_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING START POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleClearPoll(msg: ClearPoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    payload.put(Constants.FORCE, msg.force)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.CLEAR_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING CLEAR POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetPollResult(msg: GetPollResult) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL_ID, msg.pollID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_POLL_RESULT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET POLL RESULT *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleRespondToPoll(msg: RespondToPoll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.RESPONSE, msg.response)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.RESPONT_TO_POLL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING RESPOND TO POLL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleClearPresentation(msg: ClearPresentation) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.CLEAR_PRESENTATION)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING CLEAR PRESENTATION *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleRemovePresentation(msg: RemovePresentation) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PRESENTATION_ID, msg.presentationID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.REMOVE_PRESENTATION)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING REMOVE PRESENTATION *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetPresentationInfo(msg: GetPresentationInfo) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_PRESENTATION_INFO)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET PRESENTATION INFO *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  /*private def handleSendCursorUpdate(msg: SendCursorUpdate) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("xPercent", msg.xPercent)
    map.put("yPercent", msg.yPercent)
    map.put("timestamp", TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING SEND CURSOR UPDATE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }*/
  
  private def handleResizeAndMoveSlide(msg: ResizeAndMoveSlide) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.X_OFFSET, msg.xOffset)
    payload.put(Constants.Y_OFFSET, msg.yOffset)
    payload.put(Constants.WIDTH_RATIO, msg.widthRatio)
    payload.put(Constants.HEIGHT_RATIO, msg.heightRatio)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.RESIZE_AND_MOVE_SLIDE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING RESIZE AND MOVE SLIDE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGotoSlide(msg: GotoSlide) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PAGE, msg.page)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GO_TO_SLIDE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GO TO SLIDE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSharePresentation(msg: SharePresentation) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PRESENTATION_ID, msg.presentationID)
    payload.put(Constants.SHARE, msg.share)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SHARE_PRESENTATION)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp) 
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SHARE PRESENTATION *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetSlideInfo(msg: GetSlideInfo) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_SLIDE_INFO)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET SLIDE INFO *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePreuploadedPresentations(msg: PreuploadedPresentations) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PRESENTATIONS, msg.presentations.toString()) //#todo not tested
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PREUPLOADED_PRESENTATIONS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PREUPLOADED PRESENTATIONS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePresentationConversionUpdate(msg: PresentationConversionUpdate) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey) 
    payload.put(Constants.CODE, msg.code)
    payload.put(Constants.PRESENTATION_ID, msg.presentationId)
    payload.put(Constants.PRESENTATION_NAME, msg.presName)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PRESENTATION_CONVERSION_UPDATE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PRESENTATION CONVERSION UPDATE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePresentationPageCountError(msg: PresentationPageCountError) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey) 
    payload.put(Constants.CODE, msg.code)
    payload.put(Constants.PRESENTATION_ID, msg.presentationId)
    payload.put(Constants.PRESENTATION_NAME, msg.presName)
    payload.put(Constants.NUM_PAGES, msg.numberOfPages)
    payload.put(Constants.MAX_NUM_PAGES, msg.maxNumberPages)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PRESENTATION_PAGE_COUNT_ERROR)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PRESENTATION PAGE COUNT ERROR *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePresentationSlideGenerated(msg: PresentationSlideGenerated) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey) 
    payload.put(Constants.CODE, msg.code)
    payload.put(Constants.PRESENTATION_ID, msg.presentationId)
    payload.put(Constants.PRESENTATION_NAME, msg.presName)
    payload.put(Constants.NUM_PAGES, msg.numberOfPages)
    payload.put(Constants.PAGES_COMPLETED, msg.pagesCompleted)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PRESENTATION_PAGE_GENERATED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PRESENTATION SLIDE GENERATED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePresentationConversionCompleted(msg: PresentationConversionCompleted) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey) 
    payload.put(Constants.CODE, msg.code)
    payload.put(Constants.PRESENTATION_ID, msg.presentation)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PRESENTATION_CONVERSION_COMPLETED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PRESENTATION CONVERSION COMPLETED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSendVoiceUsersRequest(msg: SendVoiceUsersRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SEND_VOICE_USERS_REQUEST)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SEND VOICE USERS REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 
    payload.put(Constants.MUTE, msg.mute) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.MUTE_MEETING_REQUEST)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING MUTE MEETING REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.IS_MEETING_MUTED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING IS MEETING MUTED REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleMuteUserRequest(msg: MuteUserRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.MUTE, msg.mute)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.MUTE_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING MUTE USER REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleLockUserRequest(msg: LockUserRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.LOCK, msg.lock)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.LOCK_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING LOCK USER REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleEjectUserFromVoiceRequest(msg: EjectUserFromVoiceRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.ejectedBy) 
    payload.put(Constants.USER_ID, msg.userId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.EJECT_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING EJECT USER REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleVoiceUserJoinedMessage(msg: VoiceUserJoinedMessage) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.voiceConfId)
    payload.put(Constants.CALLER_ID_NUM, msg.callerIdNum)
    payload.put(Constants.CALLER_ID_NAME, msg.callerIdName)
    payload.put(Constants.MUTED, msg.muted)
    payload.put(Constants.TALKING, msg.talking)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VOICE_USER_JOINED_MESSAGE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VOICE USER JOINED MESSAGE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleVoiceUserJoined(msg: VoiceUserJoined) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.VOICE_USER, msg.voiceUser)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VOICE_USER_JOINED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VOICE USER JOINED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleVoiceUserLeft(msg: VoiceUserLeft) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VOICE_USER_LEFT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VOICE USER LEFT *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleVoiceUserLocked(msg: VoiceUserLocked) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.LOCKED, msg.locked)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VOICE_USER_LOCKED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VOICE USER LOCKED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleVoiceUserMuted(msg: VoiceUserMuted) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.MUTED, msg.muted)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VOICE_USER_MUTED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
    println("***** DISPATCHING VOICE USER MUTED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleVoiceUserTalking(msg: VoiceUserTalking) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.TALKING, msg.talking)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VOICE_USER_TALKING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VOICE USER TALKING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleVoiceRecording(msg: VoiceRecording) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDING_FILE, msg.recordingFile)
    payload.put(Constants.TIMESTAMP, msg.timestamp)
    payload.put(Constants.RECORDING, msg.recording)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VOICE_RECORDING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VOICE RECORDING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.ANNOTATION, msg.annotation)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.SEND_WHITEBOARD_ANNOTATION)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SEND WHITEBOARD ANNOTATION REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetWhiteboardShapesRequest(msg: GetWhiteboardShapesRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.WHITEBOARD_ID, msg.whiteboardId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_WHITEBOARD_SHAPES)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING SEND WHITEBOARD SHAPES REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.WHITEBOARD_ID, msg.whiteboardId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.CLEAR_WHITEBOARD)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING CLEAR WHITEBOARD REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.WHITEBOARD_ID, msg.whiteboardId)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.UNDO_WHITEBOARD)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING UNDO WHITEBOARD REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.ENABLE, msg.enable)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.ENABLE_WHITEBOARD)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING ENABLE WHITEBOARD REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.IS_WHITEBOARD_ENABLED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING IS WHITEBOARD ENABLED REQUEST *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }

  // OUT MESSAGES
  private def handleMeetingCreated(msg: MeetingCreated) {
    val json = MeetingMessageToJsonConverter.meetingCreatedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleVoiceRecordingStarted(msg: VoiceRecordingStarted) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStartedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleVoiceRecordingStopped(msg: VoiceRecordingStopped) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStoppedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    val json = MeetingMessageToJsonConverter.recordingStatusChangedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    val json = MeetingMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleMeetingEnded(msg: MeetingEnded) {
    val json = MeetingMessageToJsonConverter.meetingEndedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    val json = MeetingMessageToJsonConverter.meetingHasEndedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleMeetingDestroyed(msg: MeetingDestroyed) {
    val json = MeetingMessageToJsonConverter.meetingDestroyedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.DISCONNECT_ALL_USERS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING DISCONNECT ALL USERS *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleDisconnectUser(msg: DisconnectUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.DISCONNECT_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING DISCONNECT USER *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePermissionsSettingInitialized(msg: PermissionsSettingInitialized) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.LOCKED, msg.locked)
    payload.put(Constants.SETTINGS, msg.permissions.toString()) //#todo not tested

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PERMISSION_SETTING_INITIALIZED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PERMISSIONS SETTING INIIALIZED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.SETTINGS, msg.permissions.toString()) //#todo not tested

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.NEW_PERMISSION_SETTINGS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING NEW PERMISSIONS SETTING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLocked(msg: UserLocked) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    payload.put(Constants.LOCKED, msg.lock)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_LOCKED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER LOCKED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUsersLocked(msg: UsersLocked) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.EXCEPT_USERS, msg.exceptUsers.toString()) 
    payload.put(Constants.LOCKED, msg.lock)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USERS_LOCKED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USERS LOCKED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetPermissionsSettingReply(msg: GetPermissionsSettingReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_PERMISSION_SETTINGS_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleIsMeetingLockedReply(msg: IsMeetingLockedReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.IS_MEETING_LOCKED_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING IS MEETING LOCKED REPLY *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserRegistered(msg: UserRegistered) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER, msg.user.toString()) 
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_REGISTERED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER REGISTERED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLeft(msg: UserLeft) {
    val json = UsersMessageToJsonConverter.userLeftToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePresenterAssigned(msg: PresenterAssigned) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
	  payload.put(Constants.NEW_PRESENTER_ID, msg.presenter.presenterID);
	  payload.put(Constants.NEW_PRESENTER_NAME, msg.presenter.presenterName);
	  payload.put(Constants.ASSIGNED_BY, msg.presenter.assignedBy);
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PRESENTER_ASSIGNED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING PRESENTER ASSIGNED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleEndAndKickAll(msg: EndAndKickAll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.END_AND_KICK_ALL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING END AND KICK ALL *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetUsersReply(msg: GetUsersReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 

    val users = new ArrayList[java.util.HashMap[String, Object]];
    msg.users.foreach(uvo => {		
      users.add(buildUserHashMap(uvo))
    })
		
    payload.put(Constants.USERS, users)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_USERS_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET USERS REPLY *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterId) 
    payload.put(Constants.AUTH_TOKEN, msg.token)
    payload.put(Constants.VALID, msg.valid)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.VALIDATE_AUTH_TOKEN_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING VALIDATE AUTH TOKEN REPLY *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserJoined(msg: UserJoined) {
    val json = UsersMessageToJsonConverter.userJoinedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleUserRaisedHand(msg: UserRaisedHand) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RAISE_HAND, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_RAISED_HAND)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER RAISED HAND *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLoweredHand(msg: UserLoweredHand) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RAISE_HAND, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.LOWERED_BY, msg.loweredBy)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_LOWERED_HAND)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER LOWERED HAND *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_SHARED_WEBCAM)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER SHARED WEBCAM *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_UNSHARED_WEBCAM)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER UNSHARED WEBCAM *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserStatusChange(msg: UserStatusChange) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STATUS, msg.status)
    payload.put(Constants.VALUE, msg.value)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_STATUS_CHANGED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER STATUS CHANGE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.MUTE, msg.mute)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.MUTE_VOICE_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING MUTE VOICE USER *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserVoiceMuted(msg: UserVoiceMuted) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_VOICE_MUTED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER VOICE MUTED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserVoiceTalking(msg: UserVoiceTalking) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_VOICE_TALKING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER VOICE TALKING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.EJECT_VOICE_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING EJECT VOICE USER *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_JOINED_VOICE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER JOINED VOICE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLeftVoice(msg: UserLeftVoice) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_LEFT_VOICE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING USER LEFT VOICE *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.MUTED, msg.meetingMuted)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.IS_MEETING_MUTED_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING IS MEETING MUTED REPLY *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleStartRecording(msg: StartRecording) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.START_RECORDING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING START RECORDING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleStopRecording(msg: StopRecording) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.STOP_RECORDING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING STOP RECORDING *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetChatHistoryReply(msg: GetChatHistoryReply) {
    val json = ChatMessageToJsonConverter.getChatHistoryReplyToJson(msg)  
    dispatcher.dispatch(json)
  }
  
  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) {
    val json = ChatMessageToJsonConverter.sendPublicMessageEventToJson(msg)	  
    dispatcher.dispatch(json)
  }
  
  private def handleSendPrivateMessageEvent(msg: SendPrivateMessageEvent) {
    val json = ChatMessageToJsonConverter.sendPrivateMessageEventToJson(msg)  
    dispatcher.dispatch(json)
  }
  
  private def handleGetCurrentLayoutReply(msg: GetCurrentLayoutReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.LAYOUT_ID, msg.layoutID)
    payload.put(Constants.LOCKED, msg.locked)
    payload.put(Constants.SET_BY_USER_ID, msg.setByUserID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_CURRENT_LAYOUT_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET CURRENT LAYOUT REPLY *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleBroadcastLayoutEvent(msg: BroadcastLayoutEvent) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.LAYOUT_ID, msg.layoutID)
    payload.put(Constants.LOCKED, msg.locked)
    payload.put(Constants.SET_BY_USER_ID, msg.setByUserID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.BROADCAST_LAYOUT_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING BROADCAST LAYOUT EVENT *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  

  private def handleGetPollResultReply(msg: GetPollResultReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.POLL, msg.pollVO)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_POLL_RESULT_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET POLL RESULT REPLY *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetPollsReplyOutMsg(msg: GetPollsReplyOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val collection = new ArrayList[PollVO]();  
  	msg.polls.foreach(p => {
  	  collection.add(p)
  	})
  	    
    payload.put(Constants.POLLS,  collection)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_POLLS_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING GET POLLS REPLY OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleClearPollFailed(msg: ClearPollFailed) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.REASON, msg.reason)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.CLEAR_POLL_FAILED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING CLEAR POLL FAILED *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollClearedOutMsg(msg: PollClearedOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_CLEARED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL CLEARED OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollStartedOutMsg(msg: PollStartedOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_STARTED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL STARTED OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollStoppedOutMsg(msg: PollStoppedOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_STOPPED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL STOPPED OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollRemovedOutMsg(msg: PollRemovedOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_REMOVED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL REMOVED OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollUpdatedOutMsg(msg: PollUpdatedOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    payload.put(Constants.POLL, msg.pollVO) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_UPDATED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL UPDATED OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollCreatedOutMsg(msg: PollCreatedOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    payload.put(Constants.POLL, msg.pollVO) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_CREATED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL CREATED OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollResponseOutMsg(msg: PollResponseOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RESPONDER, msg.responder) 
    payload.put(Constants.RESPONSE, msg.response) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_RESPONSE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL RESPONSE OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollHideResultOutMsg(msg: PollHideResultOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_HIDE_RESULT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL HIDE RESULT OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handlePollShowResultOutMsg(msg: PollShowResultOutMsg) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.POLL_ID, msg.pollID) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.POLL_SHOW_RESULT)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    header.put(Constants.CURRENT_TIME, TimestampGenerator.getCurrentTime)
    
//    println("***** DISPATCHING POLL SHOW RESULT OUTMSG *****************")
    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.clearPresentationOutMsgToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.removePresentationOutMsgToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleGetPresentationInfoOutMsg(msg: GetPresentationInfoOutMsg) {
    val json = PesentationMessageToJsonConverter.getPresentationInfoOutMsgToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
    val json = PesentationMessageToJsonConverter.sendCursorUpdateOutMsgToJson(msg)
    // Comment out as we don't want to store cursor updates (ralam may 7, 2014)
    //dispatcher.dispatch(json)
  }
  
  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.resizeAndMoveSlideOutMsgToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.gotoSlideOutMsgToJson(msg)
    dispatcher.dispatch(json)    
  }
  
  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.sharePresentationOutMsgToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleGetSlideInfoOutMsg(msg: GetSlideInfoOutMsg) {
    val json = PesentationMessageToJsonConverter.getSlideInfoOutMsgToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleGetPreuploadedPresentationsOutMsg(msg: GetPreuploadedPresentationsOutMsg) {
    val json = PesentationMessageToJsonConverter.getPreuploadedPresentationsOutMsgToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePresentationConversionProgress(msg: PresentationConversionProgress) {
    val json = PesentationMessageToJsonConverter.presentationConversionProgressToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePresentationConversionError(msg: PresentationConversionError) {
    val json = PesentationMessageToJsonConverter.presentationConversionErrorToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePresentationPageGenerated(msg: PresentationPageGenerated) {
    val json = PesentationMessageToJsonConverter.presentationPageGenerated(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePresentationConversionDone(msg: PresentationConversionDone) {
    val json = PesentationMessageToJsonConverter.presentationConversionDoneToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePresentationChanged(msg: PresentationChanged) {
    val json = PesentationMessageToJsonConverter.presentationChangedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleGetPresentationStatusReply(msg: GetPresentationStatusReply) {
    val json = PesentationMessageToJsonConverter.getPresentationStatusReplyToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePresentationRemoved(msg: PresentationRemoved) {
    val json = PesentationMessageToJsonConverter.presentationRemovedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handlePageChanged(msg: PageChanged) {
    val json = PesentationMessageToJsonConverter.pageChangedToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleGetWhiteboardShapesReply(msg: GetWhiteboardShapesReply) {
    val json = WhiteboardMessageToJsonConverter.getWhiteboardShapesReplyToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {
    val json = WhiteboardMessageToJsonConverter.sendWhiteboardAnnotationEventToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
    val json = WhiteboardMessageToJsonConverter.clearWhiteboardEventToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
    val json = WhiteboardMessageToJsonConverter.undoWhiteboardEventToJson(msg)
    dispatcher.dispatch(json)
  }
  
  private def handleWhiteboardEnabledEvent(msg: WhiteboardEnabledEvent) {
    val json = WhiteboardMessageToJsonConverter.whiteboardEnabledEventToJson(msg)
    dispatcher.dispatch(json)
  }

  private def handleIsWhiteboardEnabledReply(msg: IsWhiteboardEnabledReply) {
    val json = WhiteboardMessageToJsonConverter.isWhiteboardEnabledReplyToJson(msg)
    dispatcher.dispatch(json)
  }
}
