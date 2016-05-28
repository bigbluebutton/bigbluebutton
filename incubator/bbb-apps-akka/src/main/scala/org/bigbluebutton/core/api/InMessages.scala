package org.bigbluebutton.core.api

import org.bigbluebutton.core.domain._
import spray.json.JsObject

case class InMessageHeader(name: String)
case class InHeaderAndJsonPayload(header: InMessageHeader, payload: JsObject)
case class MessageProcessException(message: String) extends Exception(message)

trait InMessage

//////////////////////////////////////////////////////////////////////////////
// System
/////////////////////////////////////////////////////////////////////////////

case class PubSubPing(system: String, timestamp: Long) extends InMessage
case class IsMeetingActorAliveMessage(meetingId: String) extends InMessage
case class KeepAliveMessage(aliveID: String) extends InMessage

//////////////////////////////////////////////////////////////////////////////
// Meeting
/////////////////////////////////////////////////////////////////////////////

case class CreateMeeting2x(meetingId: IntMeetingId, mProps: MeetingProperties2x) extends InMessage

case class MonitorNumberOfUsers(meetingId: IntMeetingId) extends InMessage
case class SendTimeRemainingUpdate(meetingId: IntMeetingId) extends InMessage
case class ExtendMeetingDuration(meetingId: IntMeetingId, userId: IntUserId) extends InMessage
case class CreateMeeting(meetingId: IntMeetingId, mProps: MeetingProperties) extends InMessage
case class InitializeMeeting(meetingId: IntMeetingId, recorded: Recorded) extends InMessage
case class DestroyMeeting(meetingId: IntMeetingId) extends InMessage
case class StartMeeting(meetingId: IntMeetingId) extends InMessage
case class EndMeeting(meetingId: IntMeetingId) extends InMessage
case class LockSetting(meetingId: IntMeetingId, locked: Boolean, settings: Map[String, Boolean]) extends InMessage

////////////////////////////////////////////////////////////////////////////////////// 
// Breakout room
/////////////////////////////////////////////////////////////////////////////////////

// Sent by user to request the breakout rooms list of a room
case class BreakoutRoomsListMessage(
  meetingId: String) extends InMessage
// Sent by user to request creation of breakout rooms
case class CreateBreakoutRooms(
  meetingId: String, durationInMinutes: Int,
  rooms: Vector[BreakoutRoomInPayload]) extends InMessage
case class BreakoutRoomInPayload(
  name: String, users: Vector[String])
// Sent by user to request for a join URL in order to be able to join a breakout room
case class RequestBreakoutJoinURLInMessage(
  meetingId: String, breakoutId: String,
  userId: String) extends InMessage
// Sent by breakout actor to tell meeting actor that breakout room has been created.
case class BreakoutRoomCreated(
  meetingId: String, breakoutRoomId: String) extends InMessage
// Sent by breakout actor to tell meeting actor the list of users in the breakout room.    
case class BreakoutRoomUsersUpdate(
  meetingId: String, breakoutId: String,
  users: Vector[BreakoutUser]) extends InMessage
// Send by internal actor to tell the breakout actor to send it's list of users to the main meeting actor.    
case class SendBreakoutUsersUpdate(
  meetingId: IntMeetingId) extends InMessage
// Sent by user to request ending all the breakout rooms
case class EndAllBreakoutRooms(
  meetingId: String) extends InMessage
// Sent by breakout actor to tell meeting actor that breakout room has been ended
case class BreakoutRoomEnded(
  meetingId: String, breakoutRoomId: String) extends InMessage
// Sent by user actor to ask for voice conference transfer 
case class TransferUserToMeetingRequest(
  meetingId: IntMeetingId, targetMeetingId: IntMeetingId, userId: IntUserId) extends InMessage

////////////////////////////////////////////////////////////////////////////////////
// Lock
///////////////////////////////////////////////////////////////////////////////////

case class LockUser(
  meetingId: IntMeetingId, userId: IntUserId, lock: Boolean) extends InMessage
case class InitLockSettings(
  meetingId: IntMeetingId, settings: Permissions) extends InMessage
case class SetLockSettings(
  meetingId: IntMeetingId, setByUser: IntUserId, settings: Permissions) extends InMessage
case class GetLockSettings(
  meetingId: IntMeetingId, userId: IntUserId) extends InMessage

//////////////////////////////////////////////////////////////////////////////////
// Users
/////////////////////////////////////////////////////////////////////////////////

case class ValidateAuthToken(
  meetingId: IntMeetingId, userId: IntUserId, token: AuthToken,
  correlationId: String, sessionId: String) extends InMessage
case class RegisterUser2xCommand(
  meetingId: IntMeetingId, userId: IntUserId, name: Name, roles: Set[Role2x],
  extUserId: ExtUserId, authToken: AuthToken, avatar: Avatar,
  logoutUrl: LogoutUrl,
  welcome: Welcome,
  dialNumbers: Set[DialNumber],
  config: Set[String],
  extData: Set[String]) extends InMessage
case class RegisterUser(
  meetingId: IntMeetingId, userId: IntUserId, name: Name, roles: Set[String],
  extUserId: ExtUserId, authToken: AuthToken) extends InMessage
case class NewUserPresence2x(
  meetingId: IntMeetingId,
  userId: IntUserId,
  token: AuthToken,
  sessionId: SessionId,
  presenceId: PresenceId,
  userAgent: PresenceUserAgent) extends InMessage
case class UserLeave2xCommand(
  meetingId: IntMeetingId,
  userId: IntUserId,
  sessionId: SessionId,
  presenceId: PresenceId,
  userAgent: PresenceUserAgent) extends InMessage
case class UserPresenceLeft2x(
  meetingId: IntMeetingId,
  userId: IntUserId,
  sessionId: SessionId,
  presenceId: PresenceId,
  userAgent: PresenceUserAgent) extends InMessage
case class ShareWebCamRequest2x(
  meetingId: IntMeetingId, userId: IntUserId,
  presenceId: PresenceId) extends InMessage
case class ViewWebCamRequest2x(
  meetingId: IntMeetingId, userId: IntUserId,
  presenceId: PresenceId, streamId: String, token: String) extends InMessage
case class UserShareWebCam2x(
  meetingId: IntMeetingId, userId: IntUserId,
  presenceId: PresenceId, stream: String) extends InMessage
case class UserUnShareWebCam2x(
  meetingId: IntMeetingId, userId: IntUserId,
  presenceId: PresenceId, stream: String) extends InMessage

case class UserJoining(
  meetingId: IntMeetingId, userId: IntUserId, token: AuthToken) extends InMessage
case class UserLeaving(
  meetingId: IntMeetingId, userId: IntUserId, sessionId: String) extends InMessage
case class GetUsers(
  meetingId: IntMeetingId, requesterId: IntUserId) extends InMessage
case class UserEmojiStatus(
  meetingId: IntMeetingId, userId: IntUserId, emojiStatus: EmojiStatus) extends InMessage
case class EjectUserFromMeeting(
  meetingId: IntMeetingId, userId: IntUserId, ejectedBy: IntUserId) extends InMessage
case class UserShareWebcam(
  meetingId: IntMeetingId, userId: IntUserId, stream: String) extends InMessage
case class UserUnshareWebcam(
  meetingId: IntMeetingId, userId: IntUserId, stream: String) extends InMessage
case class ChangeUserStatus(
  meetingId: IntMeetingId, userId: IntUserId, status: String, value: Object) extends InMessage
case class AssignPresenter(
  meetingId: IntMeetingId, newPresenterId: IntUserId,
  newPresenterName: Name, assignedBy: IntUserId) extends InMessage
case class SetRecordingStatus(
  meetingId: IntMeetingId, userId: IntUserId, recording: Boolean) extends InMessage
case class GetRecordingStatus(
  meetingId: IntMeetingId, userId: IntUserId) extends InMessage

//////////////////////////////////////////////////////////////////////////////////
// Chat
/////////////////////////////////////////////////////////////////////////////////

case class GetChatHistoryRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, replyTo: String) extends InMessage
case class SendPublicMessageRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, message: Map[String, String]) extends InMessage
case class SendPrivateMessageRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, message: Map[String, String]) extends InMessage
case class UserConnectedToGlobalAudio(
  meetingId: IntMeetingId,
  /** Not used. Just to satisfy trait **/
  voiceConf: String, userId: IntUserId, name: Name) extends InMessage
case class UserDisconnectedFromGlobalAudio(
  meetingId: IntMeetingId,
  /** Not used. Just to satisfy trait **/
  voiceConf: String, userId: IntUserId, name: Name) extends InMessage

///////////////////////////////////////////////////////////////////////////////////////
// Layout
//////////////////////////////////////////////////////////////////////////////////////

case class GetCurrentLayoutRequest(
  meetingId: IntMeetingId, requesterId: IntUserId) extends InMessage
case class SetLayoutRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, layoutID: String) extends InMessage
case class LockLayoutRequest(
  meetingId: IntMeetingId, setById: IntUserId, lock: Boolean, viewersOnly: Boolean,
  layout: Option[String]) extends InMessage
case class BroadcastLayoutRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, layout: String) extends InMessage

//////////////////////////////////////////////////////////////////////////////////////
// Presentation
/////////////////////////////////////////////////////////////////////////////////////

case class ClearPresentation(
  meetingId: IntMeetingId) extends InMessage
case class RemovePresentation(
  meetingId: IntMeetingId, presentationId: PresentationId) extends InMessage
case class GetPresentationInfo(
  meetingId: IntMeetingId, requesterId: IntUserId, replyTo: String) extends InMessage
case class SendCursorUpdate(
  meetingId: IntMeetingId, xPercent: Double, yPercent: Double) extends InMessage
case class ResizeAndMoveSlide(
  meetingId: IntMeetingId, xOffset: Double, yOffset: Double,
  widthRatio: Double, heightRatio: Double) extends InMessage
case class GotoSlide(
  meetingId: IntMeetingId, page: String) extends InMessage
case class SharePresentation(
  meetingId: IntMeetingId, presentationId: PresentationId, share: Boolean) extends InMessage
case class GetSlideInfo(
  meetingId: IntMeetingId, requesterId: IntUserId, replyTo: String) extends InMessage
case class PreuploadedPresentations(
  meetingId: IntMeetingId, presentations: Seq[Presentation]) extends InMessage
case class PresentationConversionUpdate(
  meetingId: IntMeetingId, messageKey: String, code: String,
  presentationId: PresentationId, presName: String) extends InMessage
case class PresentationPageCountError(
  meetingId: IntMeetingId, messageKey: String, code: String, presentationId: PresentationId,
  numberOfPages: Int, maxNumberPages: Int, presName: String) extends InMessage
case class PresentationSlideGenerated(
  meetingId: IntMeetingId, messageKey: String, code: String, presentationId: PresentationId,
  numberOfPages: Int, pagesCompleted: Int, presName: String) extends InMessage
case class PresentationConversionCompleted(
  meetingId: IntMeetingId, messageKey: String, code: String,
  presentation: Presentation) extends InMessage

/////////////////////////////////////////////////////////////////////////////////////  
// Polling
////////////////////////////////////////////////////////////////////////////////////

//case class CreatePollRequest(meetingID: String, requesterId: String, pollId: String, pollType: String) extends InMessage
case class StartCustomPollRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, pollType: String, answers: Seq[String]) extends InMessage
case class StartPollRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, pollType: String) extends InMessage
case class StopPollRequest(
  meetingId: IntMeetingId, requesterId: IntUserId) extends InMessage
case class ShowPollResultRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, pollId: String) extends InMessage
case class HidePollResultRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, pollId: String) extends InMessage
case class RespondToPollRequest(
  meetingId: IntMeetingId, requesterId: IntUserId,
  pollId: String, questionId: Int, answerId: Int) extends InMessage
case class GetPollRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, pollId: String) extends InMessage
case class GetCurrentPollRequest(
  meetingId: IntMeetingId, requesterId: IntUserId) extends InMessage

///////////////////////////////////////////////////////////////////////////////////
// Voice
///////////////////////////////////////////////////////////////////////////////////

case class InitAudioSettings(
  meetingId: IntMeetingId, requesterId: IntUserId, muted: Boolean) extends InMessage
case class SendVoiceUsersRequest(
  meetingId: IntMeetingId, requesterId: IntUserId) extends InMessage
case class MuteAllExceptPresenterRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, mute: Boolean) extends InMessage
case class MuteMeetingRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, mute: Boolean) extends InMessage
case class IsMeetingMutedRequest(
  meetingId: IntMeetingId, requesterId: IntUserId) extends InMessage
case class MuteUserRequest(
  meetingId: IntMeetingId, requesterId: IntUserId,
  userId: IntUserId, mute: Boolean) extends InMessage
case class LockUserRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, userId: IntUserId, lock: Boolean) extends InMessage
case class EjectUserFromVoiceRequest(
  meetingId: IntMeetingId, userId: IntUserId, ejectedBy: IntUserId) extends InMessage
case class VoiceUserJoinedMessage(
  meetingId: IntMeetingId, user: IntUserId, voiceConfId: VoiceConf,
  callerId: CallerId, muted: Boolean, talking: Boolean) extends InMessage
case class UserJoinedVoiceConfMessage(
  voiceConfId: VoiceConf, voiceUserId: VoiceUserId,
  userId: IntUserId, externUserId: ExtUserId, callerId: CallerId,
  muted: Muted, talking: Talking, listenOnly: ListenOnly) extends InMessage
case class UserLeftVoiceConfMessage(
  voiceConfId: VoiceConf, voiceUserId: VoiceUserId) extends InMessage
case class UserLockedInVoiceConfMessage(
  voiceConfId: VoiceConf, voiceUserId: VoiceUserId, locked: Boolean) extends InMessage
case class UserMutedInVoiceConfMessage(
  voiceConfId: VoiceConf, voiceUserId: VoiceUserId, muted: Boolean) extends InMessage
case class UserTalkingInVoiceConfMessage(
  voiceConfId: VoiceConf, voiceUserId: VoiceUserId, talking: Boolean) extends InMessage
case class VoiceConfRecordingStartedMessage(
  voiceConfId: VoiceConf, recordStream: String, recording: Boolean, timestamp: String) extends InMessage
case class UserJoinedVoiceConf(meetingId: IntMeetingId, userId: IntUserId, presenceId: PresenceId,
  voice: Voice4x) extends InMessage
case class UserLeftVoiceConf(meetingId: IntMeetingId, userId: IntUserId, presenceId: PresenceId) extends InMessage

/////////////////////////////////////////////////////////////////////////////////////
// Whiteboard
/////////////////////////////////////////////////////////////////////////////////////

case class SendWhiteboardAnnotationRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, annotation: AnnotationVO) extends InMessage
case class GetWhiteboardShapesRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, whiteboardId: String, replyTo: String) extends InMessage
case class ClearWhiteboardRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, whiteboardId: String) extends InMessage
case class UndoWhiteboardRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, whiteboardId: String) extends InMessage
case class EnableWhiteboardRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, enable: Boolean) extends InMessage
case class IsWhiteboardEnabledRequest(
  meetingId: IntMeetingId, requesterId: IntUserId, replyTo: String) extends InMessage
case class GetAllMeetingsRequest(
  meetingId: IntMeetingId /** Not used. Just to satisfy trait **/ ) extends InMessage

// Caption
case class SendCaptionHistoryRequest(
  meetingId: IntMeetingId, requesterId: IntUserId) extends InMessage
case class UpdateCaptionOwnerRequest(
  meetingId: IntMeetingId, locale: String, ownerID: String) extends InMessage
case class EditCaptionHistoryRequest(
  meetingId: IntMeetingId, userID: String, startIndex: Integer, endIndex: Integer, locale: String, text: String) extends InMessage
// DeskShare
case class DeskShareStartedRequest(conferenceName: String, callerId: String, callerIdName: String)
case class DeskShareStoppedRequest(conferenceName: String, callerId: String, callerIdName: String)
case class DeskShareRTMPBroadcastStartedRequest(conferenceName: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String)
case class DeskShareRTMPBroadcastStoppedRequest(conferenceName: String, streamname: String, videoWidth: Int, videoHeight: Int, timestamp: String)
case class DeskShareGetDeskShareInfoRequest(conferenceName: String, requesterID: String, replyTo: String)

