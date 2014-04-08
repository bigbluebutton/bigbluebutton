package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.api.CreateMeeting
import org.bigbluebutton.core.api.IDispatcher
import org.bigbluebutton.core.api.MeetingCreated

class CollectorActor(dispatcher: IDispatcher) extends Actor {

  def act() = {
	loop {
		react {
	      case msg: CreateMeeting                 => handleCreateMeeting(msg)
	      case msg: MeetingCreated                => handleMeetingCreated(msg)
	      case _ => // do nothing
	    }
	}
  }
  
  private def handleCreateMeeting(msg: CreateMeeting) {
    // convert message into JSON
    dispatcher.dispatch("***** DISPATCHING CREATE MEETING *****************")
  }
  
  private def handleMeetingCreated(msg: MeetingCreated) {
    dispatcher.dispatch("***** DISPATCHING MEETING CREATED *****************")
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