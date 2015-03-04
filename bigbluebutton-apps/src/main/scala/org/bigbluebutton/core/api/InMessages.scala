package org.bigbluebutton.core.api

import org.bigbluebutton.core.api.Role._
import org.bigbluebutton.core.apps.poll._
import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO
import org.bigbluebutton.core.apps.presentation.Presentation

trait InMessage {val meetingID: String}

case class IsMeetingActorAliveMessage ( 
    meetingId:String
)

case class KeepAliveMessage
( 
    aliveID:String
)

case class CreateMeeting
(
  meetingID: String, 
  externalMeetingID: String, 
  meetingName: String,
  recorded: Boolean, 
  voiceBridge: String,
  duration: Long,
  autoStartRecording: Boolean,
  allowStartStopRecording: Boolean
) extends InMessage
                         
case class InitializeMeeting(
  meetingID: String, 
  recorded: Boolean) extends InMessage
                             
case class DestroyMeeting(
  meetingID: String) extends InMessage

case class StartMeeting(
  meetingID: String) extends InMessage

case class EndMeeting(
  meetingID: String) extends InMessage

case class LockSetting(
  meetingID: String, 
  locked: Boolean, 
  settings: Map[String, Boolean]) extends InMessage

// Lock
case class LockUser(
  meetingID: String, 
  userId: String, 
  lock: Boolean) extends InMessage
                    
case class LockAllUsers(
  meetingID: String, 
  lock: Boolean, 
  exceptUsers: Seq[String]) extends InMessage
                        
case class InitLockSettings(
  meetingID: String, 
  locked: Boolean, 
  settings: Permissions) extends InMessage
                            
case class SetLockSettings(
    meetingID: String,  
    setByUser: String,
    settings: Permissions
) extends InMessage
                           
case class GetLockSettings(
    meetingID: String, 
    userId: String
) extends InMessage
                           
case class IsMeetingLocked(
    meetingID: String, 
    userId: String
) extends InMessage
                           

// Users
case class ValidateAuthToken(
  meetingID: String, 
  userId: String, 
  token: String,
  correlationId: String,
  sessionId: String) extends InMessage

case class RegisterUser(
    meetingID: String, 
    userID: String, 
    name: String, 
    role: Role, 
    extUserID: String,
    authToken: String
) extends InMessage
                       
case class UserJoining(
    meetingID: String, 
    userID: String,
    authToken: String
) extends InMessage
                       
case class UserLeaving(
    meetingID: String, 
    userID: String,
    sessionId: String
) extends InMessage
                       
case class GetUsers(
    meetingID: String, 
    requesterID: String
) extends InMessage
 
case class UserRaiseHand(
    meetingID: String, 
    userId: String
) extends InMessage

case class UserLowerHand(
    meetingID: String, 
    userId: String, 
    loweredBy: String
) extends InMessage

case class EjectUserFromMeeting(meetingID: String, userId: String, ejectedBy: String) extends InMessage

case class UserShareWebcam(
    meetingID: String, 
    userId: String, 
    stream: String
) extends InMessage

case class UserUnshareWebcam(
    meetingID: String, 
    userId: String
) extends InMessage
                         
case class ChangeUserStatus(
    meetingID: String, 
    userID: String, 
    status: String, 
    value: Object
) extends InMessage
                            
case class AssignPresenter(
    meetingID: String, 
    newPresenterID: String, 
    newPresenterName: String, 
    assignedBy: String
) extends InMessage
                           
case class SetRecordingStatus(
    meetingID: String, 
    userId: String, 
    recording: Boolean
) extends InMessage
                              
case class GetRecordingStatus(
    meetingID: String, 
    userId: String
) extends InMessage

// Chat
case class GetChatHistoryRequest(
    meetingID: String, 
    requesterID: String,
    replyTo: String
) extends InMessage
                                 
case class SendPublicMessageRequest(
    meetingID: String, 
    requesterID: String, 
    message: Map[String, String]
) extends InMessage
                                    
case class SendPrivateMessageRequest(
    meetingID: String, 
    requesterID: String, 
    message: Map[String, String]
) extends InMessage

case class UserConnectedToGlobalAudio(
    meetingID: String, /** Not used. Just to satisfy trait **/
    voiceConf: String,
    userid: String,
    name: String
) extends InMessage

case class UserDisconnectedFromGlobalAudio(
    meetingID: String, /** Not used. Just to satisfy trait **/
    voiceConf: String,
    userid: String,
    name: String
) extends InMessage

// Layout
case class GetCurrentLayoutRequest(
    meetingID: String, 
    requesterID: String
) extends InMessage
                                   
case class SetLayoutRequest(
    meetingID: String, 
    requesterID: String, 
    layoutID: String
) extends InMessage

case class LockLayoutRequest(
  meetingID: String, 
  setById: String,
  lock: Boolean,
  viewersOnly: Boolean,
  layout: Option[String]
) extends InMessage

case class BroadcastLayoutRequest(
    meetingID: String, 
    requesterID: String, 
    layout: String
) extends InMessage
                             
// Poll
case class PreCreatedPoll(
    meetingID: String, 
    poll: PollVO
) extends InMessage

case class CreatePoll(
    meetingID: String, 
    requesterID: String, 
    poll: PollVO
) extends InMessage
                      
case class UpdatePoll(
    meetingID: String, 
    requesterID: String, 
    poll: PollVO
) extends InMessage
                      
case class GetPolls(
    meetingID: String, 
    requesterID: String
) extends InMessage

case class DestroyPoll(
    meetingID: String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                       
case class RemovePoll(
    meetingID: String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                      
case class SharePoll(
    meetingID: String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                     
case class ShowPollResult(
    meetingID: String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                          
case class HidePollResult(
    meetingID: String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                          
case class StopPoll(
    meetingID:String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                    
case class StartPoll(
    meetingID:String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                     
case class ClearPoll(
    meetingID: String, 
    requesterID: String, 
    pollID: String, 
    force: Boolean=false
) extends InMessage
                     
case class GetPollResult(
    meetingID:String, 
    requesterID: String, 
    pollID: String
) extends InMessage
                         
case class RespondToPoll(
    meetingID: String, 
    requesterID: String, 
    response: PollResponseVO
) extends InMessage

// Presentation
case class ClearPresentation(
    meetingID: String
) extends InMessage

case class RemovePresentation(
    meetingID: String, 
    presentationID: String
) extends InMessage

case class GetPresentationInfo(
    meetingID: String, 
    requesterID: String,
    replyTo:String
) extends InMessage

case class SendCursorUpdate(
    meetingID: String, 
    xPercent: Double, 
    yPercent: Double
) extends InMessage

case class ResizeAndMoveSlide(
    meetingID: String, 
    xOffset: Double, 
    yOffset: Double, 
    widthRatio: Double, 
    heightRatio: Double
) extends InMessage

case class GotoSlide(
    meetingID: String, 
    page: String
) extends InMessage

case class SharePresentation(
    meetingID: String, 
    presentationID: String, 
    share: Boolean
) extends InMessage

case class GetSlideInfo(
    meetingID: String, 
    requesterID: String,
    replyTo: String
) extends InMessage

case class PreuploadedPresentations(
    meetingID: String, 
    presentations: Seq[Presentation]
) extends InMessage

case class PresentationConversionUpdate(
    meetingID: String, 
    messageKey: String, 
    code: String, 
    presentationId: String,
    presName: String
) extends InMessage

case class PresentationPageCountError(
    meetingID: String, 
    messageKey: String, 
    code: String, 
    presentationId: String, 
    numberOfPages: Int, 
    maxNumberPages: Int,
    presName: String
) extends InMessage

case class PresentationSlideGenerated(
    meetingID: String, 
    messageKey: String, 
    code: String, 
    presentationId: String, 
    numberOfPages: Int, 
    pagesCompleted: Int,
    presName: String
) extends InMessage

case class PresentationConversionCompleted(
    meetingID: String, 
    messageKey: String, 
    code: String,  
    presentation: Presentation
) extends InMessage                       
                       
// Voice
case class SendVoiceUsersRequest(
    meetingID: String, 
    requesterID: String) extends InMessage

case class MuteAllExceptPresenterRequest(
    meetingID: String, 
    requesterID: String, 
    mute: Boolean) extends InMessage
    
case class MuteMeetingRequest(
    meetingID: String, 
    requesterID: String, 
    mute: Boolean) extends InMessage
    
case class IsMeetingMutedRequest(
    meetingID: String, 
    requesterID: String) extends InMessage
    
case class MuteUserRequest(
    meetingID: String, 
    requesterID: String, 
    userID: String, 
    mute: Boolean) extends InMessage
    
case class LockUserRequest(
    meetingID: String, 
    requesterID: String, 
    userID: String, 
    lock: Boolean) extends InMessage
    
case class EjectUserFromVoiceRequest(
    meetingID: String, 
    userId: String, 
    ejectedBy: String) extends InMessage
    
case class VoiceUserJoinedMessage(
    meetingID: String,
    user: String, 
    voiceConfId: String, 
    callerIdNum: String, 
    callerIdName: String, 
    muted: Boolean, 
    talking: Boolean) extends InMessage
    

case class VoiceUserJoined(
    meetingID: String, 
    voiceUser: VoiceUser
) extends InMessage  

case class VoiceUserLeft(
    meetingID: String, 
    userId: String
) extends InMessage

case class VoiceUserLocked(
    meetingID: String, 
    userId: String, 
    locked: Boolean
) extends InMessage

case class VoiceUserMuted(
    meetingID: String, 
    userId: String, 
    muted: Boolean
) extends InMessage

case class VoiceUserTalking(
    meetingID: String, 
    userId: String, 
    talking: Boolean
) extends InMessage

case class VoiceRecording(
    meetingID: String, 
    recordingFile: String, 
	timestamp: String, 
	recording: Boolean
) extends InMessage

// Whiteboard
case class SendWhiteboardAnnotationRequest(
    meetingID: String, 
    requesterID: String, 
    annotation: AnnotationVO
) extends InMessage

case class GetWhiteboardShapesRequest(
    meetingID: String, 
    requesterID: String, 
    whiteboardId: String,
    replyTo: String
) extends InMessage

case class ClearWhiteboardRequest(
    meetingID: String, 
    requesterID: String,
    whiteboardId: String
) extends InMessage

case class UndoWhiteboardRequest(
    meetingID: String, 
    requesterID: String,
    whiteboardId: String
) extends InMessage

case class EnableWhiteboardRequest(
    meetingID: String,
    requesterID: String, 
    enable: Boolean
) extends InMessage

case class IsWhiteboardEnabledRequest(
    meetingID: String, 
    requesterID: String,
    replyTo: String
) extends InMessage

case class GetAllMeetingsRequest(
    meetingID: String /** Not used. Just to satisfy trait **/
    ) extends InMessage
