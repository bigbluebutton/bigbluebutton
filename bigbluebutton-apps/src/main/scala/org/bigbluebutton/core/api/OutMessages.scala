package org.bigbluebutton.core.api

import org.bigbluebutton.core.apps.poll._
import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO
import org.bigbluebutton.core.apps.presentation.CurrentPresentationInfo
import org.bigbluebutton.core.apps.presentation.Presentation
import org.bigbluebutton.core.apps.presentation.Page

abstract class OutMessage

case class VoiceRecordingStarted(
    meetingID: String, 
    recorded: Boolean,
    recordingFile: String, 
    timestamp: String,
    confNum: String
) extends IOutMessage

case class VoiceRecordingStopped(
    meetingID: String, 
    recorded: Boolean,
    recordingFile: String, 
	timestamp: String,
	confNum: String
) extends IOutMessage

case class RecordingStatusChanged(
    meetingID: String, 
    recorded: Boolean,
    userId: String, 
    recording: Boolean
) extends IOutMessage

case class GetRecordingStatusReply(
    meetingID: String, 
    recorded: Boolean,
    userId: String, 
    recording: Boolean
) extends IOutMessage
                          
case class MeetingCreated(
    meetingID: String, 
    recorded: Boolean, 
    voiceBridge: String
) extends IOutMessage

case class MeetingEnded(
    meetingID: String, 
    recorded: Boolean, 
    voiceBridge: String
) extends IOutMessage

case class MeetingDestroyed(
    meetingID: String
) extends IOutMessage

case class KeepAliveMessageReply(
    aliveID:String
) extends IOutMessage

case object IsAliveMessage extends IOutMessage

// Permissions
case class PermissionsSettingInitialized(
    meetingID: String, 
    locked: Boolean, 
    settings: PermissionsSetting
) extends IOutMessage
    
case class NewPermissionsSetting(
    meetingID: String, 
    settings: PermissionsSetting
) extends IOutMessage

case class UserLocked(
    meetingID: String, 
    userId: String, 
    lock: Boolean
) extends IOutMessage
                           
case class UsersLocked(
    meetingID: String, 
    lock: Boolean, 
    exceptUsers: Seq[String]
) extends IOutMessage
                           
case class GetPermissionsSettingReply(
    meetingID: String, 
    userId: String
) extends IOutMessage
                           
case class IsMeetingLockedReply(
    meetingID: String, 
    userId: String
) extends IOutMessage

// Users
case class UserRegistered(
    meetingID: String,
    recorded: Boolean,
    user: RegisteredUser
) extends IOutMessage

case class UserLeft(
    meetingID: String, 
    recorded: Boolean, 
    user:UserVO
) extends IOutMessage

case class PresenterAssigned(
    meetingID: String, 
    recorded: Boolean, 
    presenter: Presenter
) extends IOutMessage

case class EndAndKickAll(
    meetingID: String, 
    recorded: Boolean
) extends IOutMessage

case class GetUsersReply(
    meetingID: String, 
    requesterID: String, 
    users: Array[UserVO]
) extends IOutMessage
                         
case class ValidateAuthTokenReply(
  meetingID: String, 
  requesterId: String,
  token: String,
  valid: Boolean) extends IOutMessage

case class UserJoined(
    meetingID: String, 
    recorded: Boolean, 
    user:UserVO
) extends IOutMessage
                      
case class UserRaisedHand(
    meetingID: String, 
    recorded: Boolean, 
    userID: String
) extends IOutMessage

case class UserLoweredHand(
    meetingID: String, 
    recorded: Boolean, 
    userID: String, 
    loweredBy: String
) extends IOutMessage
                      
case class UserSharedWebcam(
    meetingID: String, 
    recorded: Boolean, 
    userID: String, 
    stream: String
) extends IOutMessage
                      
case class UserUnsharedWebcam(
    meetingID: String, 
    recorded: Boolean, 
    userID: String, 
    stream: String
) extends IOutMessage
                      
case class UserStatusChange(
    meetingID: String, 
    recorded: Boolean, 
    userID: String, 
    status: String, 
    value: Object
) extends IOutMessage
                      
case class MuteVoiceUser(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    userId: String, 
    mute: Boolean
) extends IOutMessage

case class UserVoiceMuted(
    meetingID: String, 
    recorded: Boolean, 
    confNum: String,
    user:UserVO
) extends IOutMessage

case class UserVoiceTalking(
    meetingID: String, 
    recorded: Boolean, 
    confNum: String,
    user:UserVO
) extends IOutMessage

case class EjectVoiceUser(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    userId: String
) extends IOutMessage

case class UserJoinedVoice(
    meetingID: String, 
    recorded: Boolean, 
    confNum: String,
    user:UserVO
) extends IOutMessage

case class UserLeftVoice(
    meetingID: String, 
    recorded: Boolean, 
    confNum: String,
    user:UserVO
) extends IOutMessage
                           
// Voice
case class IsMeetingMutedReply(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    meetingMuted: Boolean
) extends IOutMessage

case class StartRecording(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String
) extends IOutMessage

case class StopRecording(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String
) extends IOutMessage

// Chat
case class GetChatHistoryReply(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    history: Array[Map[String, String]]
) extends IOutMessage

case class SendPublicMessageEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    message: Map[String, String]
) extends IOutMessage

case class SendPrivateMessageEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    message: Map[String, String]
) extends IOutMessage

// Layout
case class GetCurrentLayoutReply(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    layoutID: String, 
    locked: Boolean, 
    setByUserID: String
) extends IOutMessage

case class SetLayoutEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    layoutID: String, 
    locked: Boolean, 
    setByUserID: String
) extends IOutMessage

case class LockLayoutEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    layoutID: String, 
    locked: Boolean, 
    setByUserID: String
) extends IOutMessage

case class UnlockLayoutEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    layoutID: String, 
    locked: Boolean, 
    setByUserID: String
) extends IOutMessage

// Poll
case class GetPollResultReply(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    pollVO: PollVO
) extends IOutMessage

case class GetPollsReplyOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    polls: Array[PollVO]
) extends IOutMessage

case class ClearPollFailed(
    meetingID: String, 
    pollID: String, 
    requesterID: String, 
    reason: String
) extends IOutMessage

case class PollClearedOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    pollID: String
) extends IOutMessage

case class PollStartedOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    pollID: String
) extends IOutMessage

case class PollStoppedOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    pollID: String
) extends IOutMessage

case class PollRemovedOutMsg(
    meetingID: String, 
    recorded: Boolean,
    pollID: String
) extends IOutMessage

case class PollUpdatedOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    pollID: String, 
    pollVO: PollVO
) extends IOutMessage

case class PollCreatedOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    pollID: String, 
    pollVO: PollVO
) extends IOutMessage

case class PollResponseOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    responder: Responder, 
    response: PollResponseVO
) extends IOutMessage

case class PollHideResultOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    pollID: String
) extends IOutMessage

case class PollShowResultOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    pollID: String
) extends IOutMessage

// Presentation
case class ClearPresentationOutMsg(
    meetingID: String, 
    recorded: Boolean
) extends IOutMessage
                                   
case class RemovePresentationOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    presentationID: String
) extends IOutMessage
                                    
case class GetPresentationInfoOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    info: CurrentPresentationInfo
) extends IOutMessage
                                     
case class SendCursorUpdateOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    xPercent: Double, 
    yPercent: Double
) extends IOutMessage
                                  
case class ResizeAndMoveSlideOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    page: Page
) extends IOutMessage
                                    
case class GotoSlideOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    page: Page
) extends IOutMessage
                                    
case class SharePresentationOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    presentation: Presentation
) extends IOutMessage
                                   
case class GetSlideInfoOutMsg(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    page: Page
) extends IOutMessage
                              
case class GetPreuploadedPresentationsOutMsg(
    meetingID:String, 
    recorded: Boolean
) extends IOutMessage

case class PresentationConversionProgress(
    meetingID: String, 
    messageKey: String, 
    code: String, 
    presentationId: String,
    presentationName: String
) extends IOutMessage

case class PresentationConversionError(
    meetingID: String, 
    messageKey: String, 
    code: String, 
    presentationId: String, 
    numberOfPages: Int, 
    maxNumberPages: Int,
    presentationName: String
) extends IOutMessage

case class PresentationPageGenerated(
    meetingID: String, 
    messageKey: String, 
    code: String, 
    presentationId: String, 
    numberOfPages: Int, 
    pagesCompleted: Int,
    presentationName: String
) extends IOutMessage

case class PresentationConversionDone(
    meetingID: String, 
    messageKey: String, 
    code: String,  
    presentation: Presentation
) extends IOutMessage
       
case class PresentationChanged(
    meetingID: String,
    presentation: Presentation
) extends IOutMessage

case class GetPresentationStatusReply(
    meetingID: String,
    presentations: Seq[Presentation],
    current: Presentation
) extends IOutMessage

case class PresentationRemoved(
  meetingID: String,
  presentationId: String
) extends IOutMessage

case class PageChanged(
  meetingID: String,
  page: Page
) extends IOutMessage

// Whiteboard
case class GetWhiteboardShapesReply(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    whiteboardId: String, 
    shapes: Array[AnnotationVO]
) extends IOutMessage
                       
case class SendWhiteboardAnnotationEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    whiteboardId: String, 
    shape: AnnotationVO
) extends IOutMessage
                                            
case class ClearWhiteboardEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    whiteboardId: String
) extends IOutMessage
                       
case class UndoWhiteboardEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    whiteboardId: String,
    shapeId: String
) extends IOutMessage
                       
                       
case class WhiteboardEnabledEvent(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    enable: Boolean
) extends IOutMessage
                       
case class IsWhiteboardEnabledReply(
    meetingID: String, 
    recorded: Boolean, 
    requesterID: String, 
    enabled: Boolean
) extends IOutMessage
                       

// Value Objects
case class MeetingVO(
    id: String, 
    recorded: Boolean
)

