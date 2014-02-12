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
import net.lag.logging.Logger

case object StopMeetingActor

case class LockSettings(allowModeratorLocking: Boolean, disableCam: Boolean, 
                        disableMic: Boolean, disablePrivateChat: Boolean, 
                        disablePublicChat: Boolean)
                         
class MeetingActor(val meetingID: String, val recorded: Boolean, 
                   val voiceBridge: String, val outGW: MessageOutGateway) 
                   extends Actor with UsersApp with PresentationApp
                   with PollApp with LayoutApp with ChatApp
                   with WhiteboardApp {  
  private val log = Logger.get
  
  var lockSettings = new LockSettings(true, true, true, true, true)
  var recordingStatus = false;

  def act() = {
	loop {
	  react {
	    case message: VoiceUserJoined =>
	                         handleVoiceUserJoined(message)
	    case message: VoiceUserLeft =>
	                         handleVoiceUserLeft(message)
	    case message: VoiceUserMuted =>
	                         handleVoiceUserMuted(message)
	    case message: VoiceUserTalking =>
	                         handleVoiceUserTalking(message)
    	case message: UserJoining => 
      	                     handleUserJoin(message)
	    case message: UserLeaving => 
	                         handleUserLeft(message)
	    case message: AssignPresenter => 
	                         handleAssignPresenter(message)
	    case message: GetUsers => 
	                         handleGetUsers(message)
	    case message: ChangeUserStatus => 
	                         handleChangeUserStatus(message)
	    case message: UserRaiseHand =>
	                         handleUserRaiseHand(message)
	    case message: UserLowerHand =>
	                         handleUserLowerHand(message)
	    case message: UserShareWebcam =>
	                         handleUserShareWebcam(message)
	    case message: UserUnshareWebcam =>
	                         handleUserunshareWebcam(message)
	    case message: MuteMeetingRequest => 
	                         handleMuteMeetingRequest(message)
	    case message: IsMeetingMutedRequest => 
	                         handleIsMeetingMutedRequest(message)
	    case message: MuteUserRequest => 
	                         handleMuteUserRequest(message)
	    case message: LockUserRequest => 
	                         handleLockUserRequest(message)
	    case message: EjectUserRequest => 
	                         handleEjectUserRequest(message)
	    case message: SetLockSettings => 
	                         handleSetLockSettings(message)
	    case message: InitLockSettings => 
	                         handleInitLockSettings(message)
	    case message: LockUser => 
	                         handleLockUser(message)
	    case message: LockAllUsers => 
	                         handleLockAllUsers(message)
	    case message: GetLockSettings => 
	                         handleGetLockSettings(message)
	    case message: IsMeetingLocked => 
	                         handleIsMeetingLocked(message)
	    case message: GetChatHistoryRequest => 
	                         handleGetChatHistoryRequest(message) 
	    case message: SendPublicMessageRequest => 
	                         handleSendPublicMessageRequest(message)
	    case message: SendPrivateMessageRequest => 
	                         handleSendPrivateMessageRequest(message)
	    case message: GetCurrentLayoutRequest => 
	                         handleGetCurrentLayoutRequest(message)
	    case message: SetLayoutRequest => 
	                         handleSetLayoutRequest(message)
	    case message: LockLayoutRequest => 
	                         handleLockLayoutRequest(message)
	    case message: UnlockLayoutRequest => 
	                         handleUnlockLayoutRequest(message)
	    case message: InitializeMeeting => 
	                         handleInitializeMeeting(message)
    	case message: ClearPresentation => 
    	                     handleClearPresentation(message)
    	case message: PresentationConversionUpdate =>
    	                     handlePresentationConversionUpdate(message)
    	case message: PresentationPageCountError =>
    	                     handlePresentationPageCountError(message)
    	case message: PresentationSlideGenerated =>
    	                     handlePresentationSlideGenerated(message)
    	case message: PresentationConversionCompleted =>
    	                     handlePresentationConversionCompleted(message)
    	case message: RemovePresentation => 
    	                     handleRemovePresentation(message)
    	case message: GetPresentationInfo => 
    	                     handleGetPresentationInfo(message)
    	case message: SendCursorUpdate => 
    	                     handleSendCursorUpdate(message)
    	case message: ResizeAndMoveSlide => 
    	                     handleResizeAndMoveSlide(message)
    	case message: GotoSlide => 
    	                     handleGotoSlide(message)
    	case message: SharePresentation => 
    	                     handleSharePresentation(message)
    	case message: GetSlideInfo => 
    	                     handleGetSlideInfo(message)
    	case message: PreuploadedPresentations => 
    	                     handlePreuploadedPresentations(message)
        case message: PreCreatedPoll => 
                             handlePreCreatedPoll(message)
        case message: CreatePoll => 
                             handleCreatePoll(message)
        case message: UpdatePoll => 
                             handleUpdatePoll(message)
        case message: DestroyPoll => 
                             handleDestroyPoll(message)
        case message: RemovePoll => 
                             handleRemovePoll(message)
        case message: SharePoll => 
                             handleSharePoll(message)
        case message: StopPoll => 
                             handleStopPoll(message)
        case message: StartPoll => 
                             handleStartPoll(message)
        case message: ClearPoll => 
                             handleClearPoll(message)
        case message: GetPolls => 
                             handleGetPolls(message)
        case message: RespondToPoll => 
                             handleRespondToPoll(message)
        case message: HidePollResult => 
                             handleHidePollResult(message)
        case message: ShowPollResult => 
                             handleShowPollResult(message)
	    case message: SendWhiteboardAnnotationRequest => 
	                         handleSendWhiteboardAnnotationRequest(message)
	    case message: SetWhiteboardActivePageRequest => 
	                         handleSetWhiteboardActivePageRequest(message)
	    case message: SendWhiteboardAnnotationHistoryRequest => 
	                         handleSendWhiteboardAnnotationHistoryRequest(message)
	    case message: ClearWhiteboardRequest => 
	                         handleClearWhiteboardRequest(message)
	    case message: UndoWhiteboardRequest => 
	                         handleUndoWhiteboardRequest(message)
	    case message: SetActivePresentationRequest => 
	                         handleSetActivePresentationRequest(message)
	    case message: EnableWhiteboardRequest => 
	                         handleEnableWhiteboardRequest(message)
	    case message: IsWhiteboardEnabledRequest => 
	                         handleIsWhiteboardEnabledRequest(message)
	    case StopMeetingActor => exit
	    case _ => // do nothing
	  }
	}
  }	
}