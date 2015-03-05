package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.apps.poll.PollApp
import org.bigbluebutton.core.apps.poll.Poll
import org.bigbluebutton.core.apps.poll.PollApp
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps.presentation.PresentationApp
import org.bigbluebutton.core.apps.layout.LayoutApp
import org.bigbluebutton.core.apps.chat.ChatApp
import org.bigbluebutton.core.apps.whiteboard.WhiteboardApp
import scala.actors.TIMEOUT
import java.util.concurrent.TimeUnit
import org.bigbluebutton.core.util._

case object StopMeetingActor
                      
class MeetingActor(val meetingID: String, val externalMeetingID: String, val meetingName: String, val recorded: Boolean, 
                   val voiceBridge: String, duration: Long, 
                   val autoStartRecording: Boolean, val allowStartStopRecording: Boolean,
                   val outGW: MessageOutGateway) 
                   extends Actor with UsersApp with PresentationApp
                   with PollApp with LayoutApp with ChatApp
                   with WhiteboardApp with LogHelper {  

  var audioSettingsInited = false
  var permissionsInited = false
  var permissions = new Permissions()
  var recording = false;
  var muted = false;
  var meetingEnded = false

  def getDuration():Long = {
    duration
  }

  def getMeetingName():String = {
    meetingName
  }

  def getRecordedStatus():Boolean = {
    recorded
  }

  def getVoiceBridgeNumber():String = {
    voiceBridge
  }
  
  val TIMER_INTERVAL = 30000
  var hasLastWebUserLeft = false
  var lastWebUserLeftOn:Long = 0

  class TimerActor(val timeout: Long, val who: Actor, val reply: String) extends Actor {
    def act {
        reactWithin(timeout) {
          case TIMEOUT => who ! reply
        }
    }
  }
  
  def act() = {
	loop {
	  react {
	    case "StartTimer"                                => handleStartTimer
	    case "Hello"                                     => handleHello
	    case "MonitorNumberOfWebUsers"                   => handleMonitorNumberOfWebUsers()
	    case msg: ValidateAuthToken                      => handleValidateAuthToken(msg)
	    case msg: RegisterUser                           => handleRegisterUser(msg)
	    case msg: VoiceUserJoined                        => handleVoiceUserJoined(msg)
	    case msg: VoiceUserLeft                          => handleVoiceUserLeft(msg)
	    case msg: VoiceUserMuted                         => handleVoiceUserMuted(msg)
	    case msg: VoiceUserTalking                       => handleVoiceUserTalking(msg)
    	case msg: UserJoining                            => handleUserJoin(msg)
	    case msg: UserLeaving                            => handleUserLeft(msg)
	    case msg: AssignPresenter                        => handleAssignPresenter(msg)
	    case msg: GetUsers                               => handleGetUsers(msg)
	    case msg: ChangeUserStatus                       => handleChangeUserStatus(msg)
	    case msg: EjectUserFromMeeting                   => handleEjectUserFromMeeting(msg)
	    case msg: UserRaiseHand                          => handleUserRaiseHand(msg)
	    case msg: UserLowerHand                          => handleUserLowerHand(msg)
	    case msg: UserShareWebcam                        => handleUserShareWebcam(msg)
	    case msg: UserUnshareWebcam                      => handleUserunshareWebcam(msg)
	    case msg: MuteMeetingRequest                     => handleMuteMeetingRequest(msg)
	    case msg: MuteAllExceptPresenterRequest          => handleMuteAllExceptPresenterRequest(msg)
	    case msg: IsMeetingMutedRequest                  => handleIsMeetingMutedRequest(msg)
	    case msg: MuteUserRequest                        => handleMuteUserRequest(msg)
	    case msg: EjectUserFromVoiceRequest              => handleEjectUserRequest(msg)
	    case msg: SetLockSettings                        => handleSetLockSettings(msg)
      case msg: LockUserRequest                        => handleLockUserRequest(msg)
	    case msg: InitLockSettings                       => handleInitLockSettings(msg)
      case msg: InitAudioSettings                      => handleInitAudioSettings(msg)
	    case msg: GetChatHistoryRequest                  => handleGetChatHistoryRequest(msg) 
	    case msg: SendPublicMessageRequest               => handleSendPublicMessageRequest(msg)
	    case msg: SendPrivateMessageRequest              => handleSendPrivateMessageRequest(msg)
	    case msg: UserConnectedToGlobalAudio             => handleUserConnectedToGlobalAudio(msg)
	    case msg: UserDisconnectedFromGlobalAudio        => handleUserDisconnectedFromGlobalAudio(msg)
	    case msg: GetCurrentLayoutRequest                => handleGetCurrentLayoutRequest(msg)
	    case msg: BroadcastLayoutRequest                 => handleBroadcastLayoutRequest(msg)
	    case msg: InitializeMeeting                      => handleInitializeMeeting(msg)
    	case msg: ClearPresentation                      => handleClearPresentation(msg)
    	case msg: PresentationConversionUpdate           => handlePresentationConversionUpdate(msg)
    	case msg: PresentationPageCountError             => handlePresentationPageCountError(msg)
    	case msg: PresentationSlideGenerated             => handlePresentationSlideGenerated(msg)
    	case msg: PresentationConversionCompleted        => handlePresentationConversionCompleted(msg)
    	case msg: RemovePresentation                     => handleRemovePresentation(msg)
    	case msg: GetPresentationInfo                    => handleGetPresentationInfo(msg)
    	case msg: SendCursorUpdate                       => handleSendCursorUpdate(msg)
    	case msg: ResizeAndMoveSlide                     => handleResizeAndMoveSlide(msg)
    	case msg: GotoSlide                              => handleGotoSlide(msg)
    	case msg: SharePresentation                      => handleSharePresentation(msg)
    	case msg: GetSlideInfo                           => handleGetSlideInfo(msg)
    	case msg: PreuploadedPresentations               => handlePreuploadedPresentations(msg)
      case msg: PreCreatedPoll                         => handlePreCreatedPoll(msg)
      case msg: CreatePoll                             => handleCreatePoll(msg)
      case msg: UpdatePoll                             => handleUpdatePoll(msg)
      case msg: DestroyPoll                            => handleDestroyPoll(msg)
      case msg: RemovePoll                             => handleRemovePoll(msg)
      case msg: SharePoll                              => handleSharePoll(msg)
      case msg: StopPoll                               => handleStopPoll(msg)
      case msg: StartPoll                              => handleStartPoll(msg)
      case msg: ClearPoll                              => handleClearPoll(msg)
      case msg: GetPolls                               => handleGetPolls(msg)
      case msg: RespondToPoll                          => handleRespondToPoll(msg)
      case msg: HidePollResult                         => handleHidePollResult(msg)
      case msg: ShowPollResult                         => handleShowPollResult(msg)
	    case msg: SendWhiteboardAnnotationRequest        => handleSendWhiteboardAnnotationRequest(msg)
	    case msg: GetWhiteboardShapesRequest             => handleGetWhiteboardShapesRequest(msg)
	    case msg: ClearWhiteboardRequest                 => handleClearWhiteboardRequest(msg)
	    case msg: UndoWhiteboardRequest                  => handleUndoWhiteboardRequest(msg)
	    case msg: EnableWhiteboardRequest                => handleEnableWhiteboardRequest(msg)
	    case msg: IsWhiteboardEnabledRequest             => handleIsWhiteboardEnabledRequest(msg)
	    case msg: SetRecordingStatus                     => handleSetRecordingStatus(msg)
	    case msg: GetRecordingStatus                     => handleGetRecordingStatus(msg)
	    case msg: VoiceRecording                         => handleVoiceRecording(msg)
	    
	    case msg: EndMeeting                             => handleEndMeeting(msg)
	    case StopMeetingActor                            => exit
	    case _ => // do nothing
	  }
	}
  }
  
  def hasMeetingEnded():Boolean = {
    meetingEnded
  }
  
  private def handleStartTimer() {
//    println("***************timer started******************")
//    val timerActor = new TimerActor(2000, self, "Hello")
//    timerActor.start
  }
  
  private def handleHello() {
//    println("***************hello received on [" + System.currentTimeMillis() + "]******************")
    
//    val timerActor = new TimerActor(2000, self, "Hello")    
//    timerActor.start
  }
  
  def webUserJoined() {
    if (users.numWebUsers > 0) {
      lastWebUserLeftOn = 0
    }      
  }
  
  def startRecordingIfAutoStart() {
    if (recorded && !recording && autoStartRecording && users.numWebUsers == 1) {
      logger.info("Auto start recording for meeting=[" + meetingID + "]")
     recording = true
     outGW.send(new RecordingStatusChanged(meetingID, recorded, "system", recording))          
    }
  }
  
  def stopAutoStartedRecording() {
    if (recorded && recording && autoStartRecording 
        && users.numWebUsers == 0) {
      logger.info("Last web user left. Auto stopping recording for meeting=[{}", meetingID)
      recording = false
      outGW.send(new RecordingStatusChanged(meetingID, recorded, "system", recording))          
    }    
  }
  
  def startCheckingIfWeNeedToEndVoiceConf() {
    if (users.numWebUsers == 0) {
      lastWebUserLeftOn = timeNowInMinutes
	    logger.debug("MonitorNumberOfWebUsers started for meeting [" + meetingID + "]")
      scheduleEndVoiceConference()
    }
  }
  
  def handleMonitorNumberOfWebUsers() {
    if (users.numWebUsers == 0 && lastWebUserLeftOn > 0) {
      if (timeNowInMinutes - lastWebUserLeftOn > 2) {
        logger.info("MonitorNumberOfWebUsers empty for meeting [" + meetingID + "]. Ejecting all users from voice.")
        outGW.send(new EjectAllVoiceUsers(meetingID, recorded, voiceBridge))
      } else {
        scheduleEndVoiceConference()
      }
    }
  }
  
  private def scheduleEndVoiceConference() {
    logger.debug("MonitorNumberOfWebUsers continue for meeting [" + meetingID + "]")
    val timerActor = new TimerActor(TIMER_INTERVAL, self, "MonitorNumberOfWebUsers")
    timerActor.start    
  }
  
  def timeNowInMinutes():Long = {
    TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  }
  
  def sendMeetingHasEnded(userId: String) {
    outGW.send(new MeetingHasEnded(meetingID, userId))
    outGW.send(new DisconnectUser(meetingID, userId))
  }
  
  private def handleEndMeeting(msg: EndMeeting) {
    meetingEnded = true
    outGW.send(new MeetingEnded(msg.meetingID, recorded, voiceBridge))
    outGW.send(new DisconnectAllUsers(msg.meetingID))
  }
  
  private def handleVoiceRecording(msg: VoiceRecording) {
     if (msg.recording) {
       outGW.send(new VoiceRecordingStarted(meetingID, 
                        recorded, msg.recordingFile, 
                        msg.timestamp, voiceBridge))
     } else {
       outGW.send(new VoiceRecordingStopped(meetingID, recorded, 
                        msg.recordingFile, msg.timestamp, voiceBridge))
     }
  }
  
  private def handleSetRecordingStatus(msg: SetRecordingStatus) {
    logger.debug("Change recording status for meeting [" + meetingID + "], recording=[" + msg.recording + "]")
    if (allowStartStopRecording && recording != msg.recording) {
     recording = msg.recording
     logger.debug("Sending recording status for meeting [" + meetingID + "], recording=[" + msg.recording + "]")
     outGW.send(new RecordingStatusChanged(meetingID, recorded, msg.userId, msg.recording))      
    }
  }   

  private def handleGetRecordingStatus(msg: GetRecordingStatus) {
     outGW.send(new GetRecordingStatusReply(meetingID, recorded, msg.userId, recording.booleanValue()))
  }
  
  def lockLayout(lock: Boolean) {
    permissions = permissions.copy(lockedLayout=lock)
  }
  
  def newPermissions(np: Permissions) {
    permissions = np
  }
  
  def permissionsEqual(other: Permissions):Boolean = {
    permissions == other
  }
  
}