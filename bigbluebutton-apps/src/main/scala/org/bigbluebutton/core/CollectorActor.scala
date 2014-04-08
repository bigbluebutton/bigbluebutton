package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.api.CreateMeeting
import org.bigbluebutton.core.api.IDispatcher
import org.bigbluebutton.core.api.MeetingCreated
import org.bigbluebutton.core.api._ //maybe remove all others?! #TODO
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
          /*case msg: SharePoll                     => handleSharePoll(msg)
          case msg: ShowPollResult                => handleShowPollResult(msg)
          case msg: HidePollResult                => handleHidePollResult(msg)
          case msg: StopPoll                      => handleStopPoll(msg)
          case msg: StartPoll                     => handleStartPoll(msg)
          case msg: ClearPoll                     => handleClearPoll(msg)
          case msg: GetPollResult                 => handleGetPollResult(msg)
          case msg: RespondToPoll                 => handleRespondToPoll(msg)
          case msg: ClearPresentation             => handleClearPresentation(msg)*/



        /*  case msg: RemovePresentation            => handleRemovePresentation(msg)
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
          case msg: IsWhiteboardEnabledRequest    => handleIsWhiteboardEnabledRequest(msg)*/

          /*case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)
          case msg:         => handle(msg)*/


          //OUT MESSAGES
  	      case msg: MeetingCreated                => handleMeetingCreated(msg)
          
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
                 
    dispatcher.dispatch("***** DISPATCHING LOCK SETTINGS *****************")
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


/*  private def handleSharePoll(msg: SharePoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SHARE POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleShowPollResult(msg: ShowPollResult) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING SHOW POLL RESULTS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleHidePollResult(msg: HidePollResult) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING HIDE POLL RESULTS *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleStopPoll(msg: StopPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING STOP POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }

  private def handleStartPoll(msg: StartPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING START POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearPoll(msg: ClearPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING CLEAR POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleGetPollResult(msg: GetPollResult) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING GET POLL RESULT *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleRespondToPoll(msg: RespondToPoll) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING RESPOND TO POLL *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handleClearPresentation(msg: ClearPresentation) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING CLEAR PRESENTATION *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }*/







/*  private def handle(msg: ) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING  *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handle(msg: ) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())

    dispatcher.dispatch("***** DISPATCHING  *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }
  private def handle(msg: ) {
    var map = new java.util.HashMap[String, Any]()
    map.put("meetingID", msg.meetingID)
    map.put("meetingName", msg.meetingName)
    map.put("timestamp", System.nanoTime())
 
    dispatcher.dispatch("***** DISPATCHING  *****************")
    dispatcher.dispatch((new Gson).toJson(map))
  }*/






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