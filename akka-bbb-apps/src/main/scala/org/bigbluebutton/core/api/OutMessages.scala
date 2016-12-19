package org.bigbluebutton.core.api

import org.bigbluebutton.core.apps.AnnotationVO
import org.bigbluebutton.core.apps.CurrentPresentationInfo
import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.apps.Page
import org.bigbluebutton.core.MeetingProperties
import org.bigbluebutton.core.apps.PollVO
import org.bigbluebutton.core.apps.SimplePollOutVO
import org.bigbluebutton.core.apps.SimplePollResultOutVO
import org.bigbluebutton.core.apps.BreakoutUser

case class VoiceRecordingStarted(meetingID: String, recorded: Boolean, recordingFile: String, timestamp: String, confNum: String) extends IOutMessage
case class VoiceRecordingStopped(meetingID: String, recorded: Boolean, recordingFile: String, timestamp: String, confNum: String) extends IOutMessage
case class RecordingStatusChanged(meetingID: String, recorded: Boolean, userId: String, recording: Boolean) extends IOutMessage
case class GetRecordingStatusReply(meetingID: String, recorded: Boolean, userId: String, recording: Boolean) extends IOutMessage
case class MeetingCreated(meetingID: String, externalMeetingID: String, parentMeetingID: String, recorded: Boolean, name: String,
  voiceBridge: String, duration: Int, moderatorPass: String, viewerPass: String, createTime: Long, createDate: String, isBreakout: Boolean) extends IOutMessage
case class MeetingMuted(meetingID: String, recorded: Boolean, meetingMuted: Boolean) extends IOutMessage
case class MeetingEnding(meetingID: String) extends IOutMessage
case class MeetingEnded(meetingID: String, recorded: Boolean, voiceBridge: String) extends IOutMessage
case class MeetingState(meetingID: String, recorded: Boolean, userId: String, permissions: Permissions, meetingMuted: Boolean) extends IOutMessage
case class MeetingHasEnded(meetingID: String, userId: String) extends IOutMessage
case class MeetingDestroyed(meetingID: String) extends IOutMessage
case class DisconnectAllUsers(meetingID: String) extends IOutMessage
case class DisconnectUser(meetingID: String, userId: String) extends IOutMessage
case class KeepAliveMessageReply(aliveID: String) extends IOutMessage
case class PubSubPong(system: String, timestamp: Long) extends IOutMessage
case object IsAliveMessage extends IOutMessage

// Breakout Rooms
case class BreakoutRoomsListOutMessage(meetingId: String, rooms: Vector[BreakoutRoomBody], roomsReady: Boolean) extends IOutMessage
case class CreateBreakoutRoom(meetingId: String, room: BreakoutRoomOutPayload) extends IOutMessage
case class EndBreakoutRoom(breakoutMeetingId: String) extends IOutMessage
case class BreakoutRoomOutPayload(breakoutMeetingId: String, name: String, parentId: String, sequence: Integer,
  voiceConfId: String, durationInMinutes: Int, moderatorPassword: String, viewerPassword: String,
  sourcePresentationId: String, sourcePresentationSlide: Int, record: Boolean)
case class BreakoutRoomJoinURLOutMessage(parentMeetingId: String, recorded: Boolean, breakoutMeetingId: String, userId: String, redirectJoinURL: String, noRedirectJoinURL: String) extends IOutMessage
case class BreakoutRoomStartedOutMessage(parentMeetingId: String, recorded: Boolean, breakout: BreakoutRoomBody) extends IOutMessage
case class BreakoutRoomBody(name: String, externalMeetingId: String, meetingId: String, sequence: Int)
case class UpdateBreakoutUsersOutMessage(parentMeetingId: String, recorded: Boolean, breakoutMeetingId: String, users: Vector[BreakoutUser]) extends IOutMessage
case class MeetingTimeRemainingUpdate(meetingId: String, recorded: Boolean, timeRemaining: Int) extends IOutMessage
case class BreakoutRoomsTimeRemainingUpdateOutMessage(meetingId: String, recorded: Boolean, timeRemaining: Int) extends IOutMessage
case class BreakoutRoomEndedOutMessage(parentMeetingId: String, meetingId: String) extends IOutMessage

// Permissions
case class PermissionsSettingInitialized(meetingID: String, permissions: Permissions, applyTo: Array[UserVO]) extends IOutMessage
case class NewPermissionsSetting(meetingID: String, setByUser: String, permissions: Permissions, applyTo: Array[UserVO]) extends IOutMessage
case class UserLocked(meetingID: String, userId: String, lock: Boolean) extends IOutMessage
case class GetPermissionsSettingReply(meetingID: String, userId: String) extends IOutMessage

// Users
case class UserRegistered(meetingID: String, recorded: Boolean, user: RegisteredUser) extends IOutMessage
case class UserLeft(meetingID: String, recorded: Boolean, user: UserVO) extends IOutMessage
case class UserEjectedFromMeeting(meetingID: String, recorded: Boolean, userId: String, ejectedBy: String) extends IOutMessage
case class PresenterAssigned(meetingID: String, recorded: Boolean, presenter: Presenter) extends IOutMessage
case class EjectAllVoiceUsers(meetingID: String, recorded: Boolean, voiceBridge: String) extends IOutMessage
case class EndAndKickAll(meetingID: String, recorded: Boolean) extends IOutMessage
case class GetUsersReply(meetingID: String, requesterID: String, users: Array[UserVO]) extends IOutMessage
case class ValidateAuthTokenTimedOut(meetingID: String, requesterId: String, token: String, valid: Boolean, correlationId: String) extends IOutMessage
case class ValidateAuthTokenReply(meetingID: String, requesterId: String, token: String, valid: Boolean, correlationId: String) extends IOutMessage
case class UserJoined(meetingID: String, recorded: Boolean, user: UserVO) extends IOutMessage
case class UserChangedEmojiStatus(meetingID: String, recorded: Boolean, emojiStatus: String, userID: String) extends IOutMessage
case class UserListeningOnly(meetingID: String, recorded: Boolean, userID: String, listenOnly: Boolean) extends IOutMessage
case class UserSharedWebcam(meetingID: String, recorded: Boolean, userID: String, stream: String) extends IOutMessage
case class UserUnsharedWebcam(meetingID: String, recorded: Boolean, userID: String, stream: String) extends IOutMessage
case class UserStatusChange(meetingID: String, recorded: Boolean, userID: String, status: String, value: Object) extends IOutMessage
case class GetUsersInVoiceConference(meetingID: String, recorded: Boolean, voiceConfId: String) extends IOutMessage
case class MuteVoiceUser(meetingID: String, recorded: Boolean, requesterID: String,
  userId: String, voiceConfId: String, voiceUserId: String, mute: Boolean) extends IOutMessage
case class UserVoiceMuted(meetingID: String, recorded: Boolean, confNum: String, user: UserVO) extends IOutMessage
case class UserVoiceTalking(meetingID: String, recorded: Boolean, confNum: String, user: UserVO) extends IOutMessage
case class EjectVoiceUser(meetingID: String, recorded: Boolean, requesterID: String, userId: String, voiceConfId: String, voiceUserId: String) extends IOutMessage
case class TransferUserToMeeting(voiceConfId: String, targetVoiceConfId: String, userId: String) extends IOutMessage
case class UserJoinedVoice(meetingID: String, recorded: Boolean, confNum: String, user: UserVO) extends IOutMessage
case class UserLeftVoice(meetingID: String, recorded: Boolean, confNum: String, user: UserVO) extends IOutMessage
case class AllowUserToShareDesktopOut(meetingID: String, userID: String, allowed: Boolean) extends IOutMessage

// Voice
case class IsMeetingMutedReply(meetingID: String, recorded: Boolean, requesterID: String, meetingMuted: Boolean) extends IOutMessage
case class StartRecording(meetingID: String, recorded: Boolean, requesterID: String) extends IOutMessage
case class StartRecordingVoiceConf(meetingID: String, recorded: Boolean, voiceConfId: String) extends IOutMessage
case class StopRecordingVoiceConf(meetingID: String, recorded: Boolean, voiceConfId: String, recordedStream: String) extends IOutMessage
case class StopRecording(meetingID: String, recorded: Boolean, requesterID: String) extends IOutMessage

// Chat
case class GetChatHistoryReply(meetingID: String, recorded: Boolean, requesterID: String,
  replyTo: String, history: Array[Map[String, String]]) extends IOutMessage
case class SendPublicMessageEvent(meetingID: String, recorded: Boolean, requesterID: String,
  message: Map[String, String]) extends IOutMessage
case class SendPrivateMessageEvent(meetingID: String, recorded: Boolean, requesterID: String,
  message: Map[String, String]) extends IOutMessage

// Layout
case class GetCurrentLayoutReply(meetingID: String, recorded: Boolean, requesterID: String, layoutID: String,
  locked: Boolean, setByUserID: String) extends IOutMessage
case class BroadcastLayoutEvent(meetingID: String, recorded: Boolean, requesterID: String,
  layoutID: String, locked: Boolean, setByUserID: String, applyTo: Array[UserVO]) extends IOutMessage
case class LockLayoutEvent(meetingID: String, recorded: Boolean, setById: String, locked: Boolean,
  applyTo: Array[UserVO]) extends IOutMessage

// Presentation
case class ClearPresentationOutMsg(meetingID: String, recorded: Boolean) extends IOutMessage
case class RemovePresentationOutMsg(meetingID: String, recorded: Boolean, presentationID: String) extends IOutMessage
case class GetPresentationInfoOutMsg(meetingID: String, recorded: Boolean, requesterID: String,
  info: CurrentPresentationInfo, replyTo: String) extends IOutMessage
case class SendCursorUpdateOutMsg(meetingID: String, recorded: Boolean, xPercent: Double, yPercent: Double) extends IOutMessage
case class ResizeAndMoveSlideOutMsg(meetingID: String, recorded: Boolean, page: Page) extends IOutMessage
case class GotoSlideOutMsg(meetingID: String, recorded: Boolean, page: Page) extends IOutMessage
case class SharePresentationOutMsg(meetingID: String, recorded: Boolean, presentation: Presentation) extends IOutMessage
case class GetSlideInfoOutMsg(meetingID: String, recorded: Boolean, requesterID: String, page: Page, replyTo: String) extends IOutMessage
case class GetPreuploadedPresentationsOutMsg(meetingID: String, recorded: Boolean) extends IOutMessage
case class PresentationConversionProgress(meetingID: String, messageKey: String, code: String,
  presentationId: String, presentationName: String) extends IOutMessage
case class PresentationConversionError(meetingID: String, messageKey: String, code: String,
  presentationId: String, numberOfPages: Int, maxNumberPages: Int, presentationName: String) extends IOutMessage
case class PresentationPageGenerated(meetingID: String, messageKey: String, code: String, presentationId: String,
  numberOfPages: Int, pagesCompleted: Int, presentationName: String) extends IOutMessage
case class PresentationConversionDone(meetingID: String, recorded: Boolean, messageKey: String, code: String,
  presentation: Presentation) extends IOutMessage
case class PresentationChanged(meetingID: String, presentation: Presentation) extends IOutMessage
case class GetPresentationStatusReply(meetingID: String, presentations: Seq[Presentation], current: Presentation, replyTo: String) extends IOutMessage
case class PresentationRemoved(meetingID: String, presentationId: String) extends IOutMessage
case class PageChanged(meetingID: String, page: Page) extends IOutMessage

// Polling
//case class PollCreatedMessage(meetingID: String, recorded: Boolean, requesterId: String, pollId: String, poll: PollVO) extends IOutMessage
//case class CreatePollReplyMessage(meetingID: String, recorded: Boolean, result: RequestResult, requesterId: String, pollId: String, pollType: String) extends IOutMessage
case class PollStartedMessage(meetingID: String, recorded: Boolean, requesterId: String, pollId: String, poll: SimplePollOutVO) extends IOutMessage
case class StartPollReplyMessage(meetingID: String, recorded: Boolean, result: RequestResult, requesterId: String, pollId: String) extends IOutMessage
case class PollStoppedMessage(meetingID: String, recorded: Boolean, requesterId: String, pollId: String) extends IOutMessage
case class StopPollReplyMessage(meetingID: String, recorded: Boolean, result: RequestResult, requesterId: String) extends IOutMessage
case class PollShowResultMessage(meetingID: String, recorded: Boolean, requesterId: String, pollId: String, poll: SimplePollResultOutVO) extends IOutMessage
case class ShowPollResultReplyMessage(meetingID: String, recorded: Boolean, result: RequestResult, requesterId: String, pollId: String) extends IOutMessage
case class PollHideResultMessage(meetingID: String, recorded: Boolean, requesterId: String, pollId: String) extends IOutMessage
case class HidePollResultReplyMessage(meetingID: String, recorded: Boolean, result: RequestResult, requesterId: String, pollId: String) extends IOutMessage
case class UserRespondedToPollMessage(meetingID: String, recorded: Boolean, presenterId: String, pollId: String, poll: SimplePollResultOutVO) extends IOutMessage
case class RespondToPollReplyMessage(meetingID: String, recorded: Boolean, result: RequestResult, requesterId: String, pollId: String) extends IOutMessage
case class GetCurrentPollReplyMessage(meetingID: String, recorded: Boolean, requesterId: String, hasPoll: Boolean, poll: Option[PollVO]) extends IOutMessage

// Whiteboard
case class GetWhiteboardShapesReply(meetingID: String, recorded: Boolean, requesterID: String, whiteboardId: String, shapes: Array[AnnotationVO], replyTo: String) extends IOutMessage
case class SendWhiteboardAnnotationEvent(meetingID: String, recorded: Boolean, requesterID: String, whiteboardId: String, shape: AnnotationVO) extends IOutMessage
case class ClearWhiteboardEvent(meetingID: String, recorded: Boolean, requesterID: String, whiteboardId: String) extends IOutMessage
case class UndoWhiteboardEvent(meetingID: String, recorded: Boolean, requesterID: String, whiteboardId: String, shapeId: String) extends IOutMessage
case class WhiteboardEnabledEvent(meetingID: String, recorded: Boolean, requesterID: String, enable: Boolean) extends IOutMessage
case class IsWhiteboardEnabledReply(meetingID: String, recorded: Boolean, requesterID: String, enabled: Boolean, replyTo: String) extends IOutMessage
case class GetAllMeetingsReply(meetings: Array[MeetingInfo]) extends IOutMessage

// Caption
case class SendCaptionHistoryReply(meetingID: String, recorded: Boolean, requesterID: String, history: Map[String, Array[String]]) extends IOutMessage
case class UpdateCaptionOwnerReply(meetingID: String, recorded: Boolean, locale: String, localeCode: String, ownerID: String) extends IOutMessage
case class EditCaptionHistoryReply(meetingID: String, recorded: Boolean, userID: String, startIndex: Integer, endIndex: Integer, locale: String, localeCode: String, text: String) extends IOutMessage
// DeskShare
case class DeskShareStartRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareStopRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareNotifyViewersRTMP(meetingID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareNotifyASingleViewer(meetingID: String, userID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareHangUp(meetingID: String, fsConferenceName: String) extends IOutMessage

// Value Objects
case class MeetingVO(id: String, recorded: Boolean)

