package org.bigbluebutton.core.api

import org.bigbluebutton.core.api.Role._
import org.bigbluebutton.core.apps.AnnotationVO
import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.MeetingProperties
import org.bigbluebutton.core.apps.BreakoutUser

trait InMessage

case class PubSubPing(system: String, timestamp: Long) extends InMessage
case class IsMeetingActorAliveMessage(meetingId: String) extends InMessage
case class KeepAliveMessage(aliveID: String) extends InMessage

case class InitializeTimerActor(meetingID: String) extends InMessage
case class MonitorNumberOfUsers(meetingID: String) extends InMessage

case class CreateMeeting(meetingID: String, mProps: MeetingProperties) extends InMessage
case class InitializeMeeting(meetingID: String, recorded: Boolean) extends InMessage
case class DestroyMeeting(meetingID: String) extends InMessage
case class StartMeeting(meetingID: String) extends InMessage
case class EndMeeting(meetingID: String) extends InMessage
case class LockSetting(meetingID: String, locked: Boolean, settings: Map[String, Boolean]) extends InMessage

// Breakout room
case class CreateBreakoutRooms(meetingId: String, durationInMinutes: Int, rooms: Vector[BreakoutRoomInPayload]) extends InMessage
case class BreakoutRoomInPayload(name: String, users: Vector[String])
case class BreakoutRoomCreated(meetingId: String, breakoutRoomId: String) extends InMessage
case class RequestBreakoutJoinURL(meetingId: String, breakoutId: String, userId: String) extends InMessage
case class BreakoutRoomUsersUpdate(meetingId: String, breakoutId: String, users: Vector[BreakoutUser]) extends InMessage
case class UpdateTimeRemaining(meetingId: String) extends InMessage

// Lock
case class LockUser(meetingID: String, userId: String, lock: Boolean) extends InMessage
case class InitLockSettings(meetingID: String, settings: Permissions) extends InMessage
case class SetLockSettings(meetingID: String, setByUser: String, settings: Permissions) extends InMessage
case class GetLockSettings(meetingID: String, userId: String) extends InMessage

// Users
case class ValidateAuthToken(meetingID: String, userId: String, token: String,
  correlationId: String, sessionId: String) extends InMessage
case class RegisterUser(meetingID: String, userID: String, name: String, role: Role,
  extUserID: String, authToken: String) extends InMessage
case class UserJoining(meetingID: String, userID: String, authToken: String) extends InMessage
case class UserLeaving(meetingID: String, userID: String, sessionId: String) extends InMessage
case class GetUsers(meetingID: String, requesterID: String) extends InMessage
case class UserEmojiStatus(meetingID: String, userId: String, emojiStatus: String) extends InMessage
case class EjectUserFromMeeting(meetingID: String, userId: String, ejectedBy: String) extends InMessage
case class UserShareWebcam(meetingID: String, userId: String, stream: String) extends InMessage
case class UserUnshareWebcam(meetingID: String, userId: String, stream: String) extends InMessage
case class ChangeUserStatus(meetingID: String, userID: String, status: String, value: Object) extends InMessage
case class AssignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String) extends InMessage
case class SetRecordingStatus(meetingID: String, userId: String, recording: Boolean) extends InMessage
case class GetRecordingStatus(meetingID: String, userId: String) extends InMessage

// Chat
case class GetChatHistoryRequest(meetingID: String, requesterID: String, replyTo: String) extends InMessage
case class SendPublicMessageRequest(meetingID: String, requesterID: String, message: Map[String, String]) extends InMessage
case class SendPrivateMessageRequest(meetingID: String, requesterID: String, message: Map[String, String]) extends InMessage
case class UserConnectedToGlobalAudio(meetingID: String, /** Not used. Just to satisfy trait **/ voiceConf: String,
  userid: String, name: String) extends InMessage
case class UserDisconnectedFromGlobalAudio(meetingID: String, /** Not used. Just to satisfy trait **/ voiceConf: String,
  userid: String, name: String) extends InMessage

// Layout
case class GetCurrentLayoutRequest(meetingID: String, requesterID: String) extends InMessage
case class SetLayoutRequest(meetingID: String, requesterID: String, layoutID: String) extends InMessage
case class LockLayoutRequest(meetingID: String, setById: String, lock: Boolean, viewersOnly: Boolean,
  layout: Option[String]) extends InMessage
case class BroadcastLayoutRequest(meetingID: String, requesterID: String, layout: String) extends InMessage

// Presentation
case class ClearPresentation(meetingID: String) extends InMessage
case class RemovePresentation(meetingID: String, presentationID: String) extends InMessage
case class GetPresentationInfo(meetingID: String, requesterID: String, replyTo: String) extends InMessage
case class SendCursorUpdate(meetingID: String, xPercent: Double, yPercent: Double) extends InMessage
case class ResizeAndMoveSlide(meetingID: String, xOffset: Double, yOffset: Double,
  widthRatio: Double, heightRatio: Double) extends InMessage
case class GotoSlide(meetingID: String, page: String) extends InMessage
case class SharePresentation(meetingID: String, presentationID: String, share: Boolean) extends InMessage
case class GetSlideInfo(meetingID: String, requesterID: String, replyTo: String) extends InMessage
case class PreuploadedPresentations(meetingID: String, presentations: Seq[Presentation]) extends InMessage
case class PresentationConversionUpdate(meetingID: String, messageKey: String, code: String,
  presentationId: String, presName: String) extends InMessage
case class PresentationPageCountError(meetingID: String, messageKey: String, code: String, presentationId: String,
  numberOfPages: Int, maxNumberPages: Int, presName: String) extends InMessage
case class PresentationSlideGenerated(meetingID: String, messageKey: String, code: String, presentationId: String,
  numberOfPages: Int, pagesCompleted: Int, presName: String) extends InMessage
case class PresentationConversionCompleted(meetingID: String, messageKey: String, code: String,
  presentation: Presentation) extends InMessage

// Polling
//case class CreatePollRequest(meetingID: String, requesterId: String, pollId: String, pollType: String) extends InMessage
case class StartCustomPollRequest(meetingID: String, requesterId: String, pollType: String, answers: Seq[String]) extends InMessage
case class StartPollRequest(meetingID: String, requesterId: String, pollType: String) extends InMessage
case class StopPollRequest(meetingID: String, requesterId: String) extends InMessage
case class ShowPollResultRequest(meetingID: String, requesterId: String, pollId: String) extends InMessage
case class HidePollResultRequest(meetingID: String, requesterId: String, pollId: String) extends InMessage
case class RespondToPollRequest(meetingID: String, requesterId: String, pollId: String, questionId: Int, answerId: Int) extends InMessage
case class GetPollRequest(meetingID: String, requesterId: String, pollId: String) extends InMessage
case class GetCurrentPollRequest(meetingID: String, requesterId: String) extends InMessage

// Voice
case class InitAudioSettings(meetingID: String, requesterID: String, muted: Boolean) extends InMessage
case class SendVoiceUsersRequest(meetingID: String, requesterID: String) extends InMessage
case class MuteAllExceptPresenterRequest(meetingID: String, requesterID: String, mute: Boolean) extends InMessage
case class MuteMeetingRequest(meetingID: String, requesterID: String, mute: Boolean) extends InMessage
case class IsMeetingMutedRequest(meetingID: String, requesterID: String) extends InMessage
case class MuteUserRequest(meetingID: String, requesterID: String, userID: String, mute: Boolean) extends InMessage
case class LockUserRequest(meetingID: String, requesterID: String, userID: String, lock: Boolean) extends InMessage
case class EjectUserFromVoiceRequest(meetingID: String, userId: String, ejectedBy: String) extends InMessage
case class VoiceUserJoinedMessage(meetingID: String, user: String, voiceConfId: String,
  callerIdNum: String, callerIdName: String, muted: Boolean, talking: Boolean) extends InMessage

case class UserJoinedVoiceConfMessage(voiceConfId: String, voiceUserId: String, userId: String, externUserId: String,
  callerIdName: String, callerIdNum: String, muted: Boolean, talking: Boolean, listenOnly: Boolean) extends InMessage
case class UserLeftVoiceConfMessage(voiceConfId: String, voiceUserId: String) extends InMessage
case class UserLockedInVoiceConfMessage(voiceConfId: String, voiceUserId: String, locked: Boolean) extends InMessage
case class UserMutedInVoiceConfMessage(voiceConfId: String, voiceUserId: String, muted: Boolean) extends InMessage
case class UserTalkingInVoiceConfMessage(voiceConfId: String, voiceUserId: String, talking: Boolean) extends InMessage
case class VoiceConfRecordingStartedMessage(voiceConfId: String, recordStream: String, recording: Boolean, timestamp: String) extends InMessage

// Whiteboard
case class SendWhiteboardAnnotationRequest(meetingID: String, requesterID: String, annotation: AnnotationVO) extends InMessage
case class GetWhiteboardShapesRequest(meetingID: String, requesterID: String, whiteboardId: String, replyTo: String) extends InMessage
case class ClearWhiteboardRequest(meetingID: String, requesterID: String, whiteboardId: String) extends InMessage
case class UndoWhiteboardRequest(meetingID: String, requesterID: String, whiteboardId: String) extends InMessage
case class EnableWhiteboardRequest(meetingID: String, requesterID: String, enable: Boolean) extends InMessage
case class IsWhiteboardEnabledRequest(meetingID: String, requesterID: String, replyTo: String) extends InMessage
case class GetAllMeetingsRequest(meetingID: String /** Not used. Just to satisfy trait **/ ) extends InMessage
