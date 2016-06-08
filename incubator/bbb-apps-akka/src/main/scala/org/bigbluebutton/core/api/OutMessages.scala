package org.bigbluebutton.core.api

import org.bigbluebutton.core.domain._

case class VoiceRecordingStarted(
  meetingId: IntMeetingId, recorded: Recorded,
  recordingFile: String, timestamp: String, confNum: String) extends IOutMessage
case class VoiceRecordingStopped(
  meetingId: IntMeetingId, recorded: Recorded,
  recordingFile: String, timestamp: String, confNum: String) extends IOutMessage
case class RecordingStatusChanged(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, recording: Boolean) extends IOutMessage
case class GetRecordingStatusReply(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, recording: Boolean) extends IOutMessage
case class MeetingCreated(meetingId: IntMeetingId, mProps: MeetingProperties2x) extends IOutMessage
case class MeetingMuted(
  meetingId: IntMeetingId, recorded: Recorded, meetingMuted: Boolean) extends IOutMessage
case class MeetingEnded(
  meetingId: IntMeetingId, recorded: Recorded, voiceBridge: String) extends IOutMessage
case class GetMeetingStateReply(
  meetingId: IntMeetingId, recorded: Recorded, userId: IntUserId,
  permissions: Permissions, meetingMuted: Boolean) extends IOutMessage
case class MeetingHasEnded(
  meetingId: IntMeetingId, userId: IntUserId) extends IOutMessage
case class MeetingDestroyed(
  meetingId: IntMeetingId) extends IOutMessage
case class DisconnectAllUsers(
  meetingId: IntMeetingId) extends IOutMessage
case class DisconnectUser2x(
  meetingId: IntMeetingId, userId: IntUserId) extends IOutMessage
case class DisconnectUser(
  meetingId: IntMeetingId, userId: IntUserId) extends IOutMessage
case class KeepAliveMessageReply(
  aliveID: String) extends IOutMessage
case class PubSubPong(
  system: String, timestamp: Long) extends IOutMessage
case object IsAliveMessage extends IOutMessage

// Breakout Rooms
case class BreakoutRoomsListOutMessage(
  meetingId: IntMeetingId, rooms: Vector[BreakoutRoomBody]) extends IOutMessage
case class CreateBreakoutRoom(
  meetingId: IntMeetingId, recorded: Recorded, room: BreakoutRoomOutPayload) extends IOutMessage
case class EndBreakoutRoom(
  breakoutId: IntMeetingId) extends IOutMessage
case class BreakoutRoomOutPayload(
  breakoutId: IntMeetingId, name: Name, parentId: IntMeetingId,
  voiceConfId: VoiceConf, durationInMinutes: Int, moderatorPassword: String, viewerPassword: String,
  defaultPresentationURL: String)
case class BreakoutRoomJoinURLOutMessage(
  meetingId: IntMeetingId, recorded: Recorded, breakoutId: IntMeetingId, userId: IntUserId, joinURL: String) extends IOutMessage
case class BreakoutRoomStartedOutMessage(
  meetingId: IntMeetingId, recorded: Recorded, breakout: BreakoutRoomBody) extends IOutMessage
case class BreakoutRoomBody(
  name: String, breakoutId: IntMeetingId)
case class UpdateBreakoutUsersOutMessage(
  meetingId: IntMeetingId, recorded: Recorded, breakoutId: IntMeetingId, users: Vector[BreakoutUser]) extends IOutMessage
case class MeetingTimeRemainingUpdate(
  meetingId: IntMeetingId, recorded: Recorded, timeRemaining: Int) extends IOutMessage
case class BreakoutRoomsTimeRemainingUpdateOutMessage(
  meetingId: IntMeetingId, recorded: Recorded, timeRemaining: Int) extends IOutMessage
case class BreakoutRoomEndedOutMessage(
  meetingId: IntMeetingId, breakoutId: IntMeetingId) extends IOutMessage

// Permissions
case class PermissionsSettingInitialized(
  meetingId: IntMeetingId, permissions: Permissions, applyTo: Array[UserVO]) extends IOutMessage
case class NewPermissionsSetting(
  meetingId: IntMeetingId, setByUser: IntUserId, permissions: Permissions, applyTo: Array[UserVO]) extends IOutMessage
case class UserLocked(
  meetingId: IntMeetingId, userId: String, lock: Boolean) extends IOutMessage
case class GetPermissionsSettingReply(
  meetingId: IntMeetingId, userId: String) extends IOutMessage

// Users
case class UserRegisteredEvent2x(
  meetingId: IntMeetingId, recorded: Recorded, user: RegisteredUser2x) extends IOutMessage
case class UserRegistered(
  meetingId: IntMeetingId, recorded: Recorded, user: RegisteredUser) extends IOutMessage
case class UserLeft2x(
  meetingId: IntMeetingId, recorded: Recorded, userId: IntUserId) extends IOutMessage
case class UserLeft(
  meetingId: IntMeetingId, recorded: Recorded, user: UserVO) extends IOutMessage
case class UserEjectedFromMeeting(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, ejectedBy: IntUserId) extends IOutMessage
case class PresenterAssigned(
  meetingId: IntMeetingId, recorded: Recorded,
  presenter: Presenter) extends IOutMessage
case class EjectAllVoiceUsers(
  meetingId: IntMeetingId, recorded: Recorded,
  voiceBridge: VoiceConf) extends IOutMessage
case class EndAndKickAll(
  meetingId: IntMeetingId, recorded: Recorded) extends IOutMessage
case class GetUsersReply(
  meetingId: IntMeetingId, requesterId: IntUserId,
  users: Array[UserVO]) extends IOutMessage
case class ValidateAuthTokenTimedOut(
  meetingId: IntMeetingId, requesterId: IntUserId,
  token: String, valid: Boolean, correlationId: String) extends IOutMessage
case class ValidateAuthTokenReply2x(
  meetingId: IntMeetingId, requesterId: IntUserId,
  token: AuthToken, valid: Boolean) extends IOutMessage
case class ValidateAuthTokenFailedReply2x(
  meetingId: IntMeetingId, requesterId: IntUserId,
  token: AuthToken, valid: Boolean, correlationId: String) extends IOutMessage
case class ValidateAuthTokenReply(
  meetingId: IntMeetingId, requesterId: IntUserId,
  token: AuthToken, valid: Boolean, correlationId: String) extends IOutMessage
case class UserJoinedEvent2x(
  meetingId: IntMeetingId, recorded: Recorded, user: User3x) extends IOutMessage
case class UserJoined(
  meetingId: IntMeetingId, recorded: Recorded, user: UserVO) extends IOutMessage
case class UserChangedEmojiStatus(
  meetingId: IntMeetingId, recorded: Recorded,
  emojiStatus: EmojiStatus, userId: IntUserId) extends IOutMessage
case class UserListeningOnly2x(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, presenceId: PresenceId,
  voice: Voice4x) extends IOutMessage
case class UserListeningOnly(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, listenOnly: Boolean) extends IOutMessage
case class UserSharedWebcam(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, stream: String) extends IOutMessage
case class UserUnsharedWebcam(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, stream: String) extends IOutMessage
case class UserStatusChange(
  meetingId: IntMeetingId, recorded: Recorded,
  userId: IntUserId, status: String, value: Object) extends IOutMessage
case class GetUsersInVoiceConference(
  meetingId: IntMeetingId, recorded: Recorded,
  voiceConfId: VoiceConf) extends IOutMessage
case class MuteVoiceUser(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId,
  userId: IntUserId, voiceConfId: VoiceConf, voiceUserId: VoiceUserId, mute: Boolean) extends IOutMessage
case class UserVoiceMuted(
  meetingId: IntMeetingId, recorded: Recorded,
  confNum: VoiceConf, user: UserVO) extends IOutMessage
case class UserVoiceTalking(
  meetingId: IntMeetingId, recorded: Recorded,
  confNum: VoiceConf, user: UserVO) extends IOutMessage
case class EjectVoiceUser(
  meetingId: IntMeetingId, recorded: Recorded,
  requesterId: IntUserId, userId: IntUserId, voiceConfId: VoiceConf,
  voiceUserId: VoiceUserId) extends IOutMessage
case class TransferUserToMeeting(
  voiceConfId: VoiceConf, targetVoiceConfId: VoiceConf,
  userId: VoiceUserId) extends IOutMessage
case class UserJoinedVoice(
  meetingId: IntMeetingId, recorded: Recorded,
  confNum: VoiceConf, user: UserVO) extends IOutMessage
case class UserLeftVoice(
  meetingId: IntMeetingId, recorded: Recorded,
  confNum: VoiceConf, user: UserVO) extends IOutMessage

// Voice
case class IsMeetingMutedReply(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, meetingMuted: Boolean) extends IOutMessage
case class StartRecording(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId) extends IOutMessage
case class StartRecordingVoiceConf(
  meetingId: IntMeetingId, recorded: Recorded, voiceConfId: VoiceConf) extends IOutMessage
case class StopRecordingVoiceConf(
  meetingId: IntMeetingId, recorded: Recorded, voiceConfId: VoiceConf, recordedStream: String) extends IOutMessage
case class StopRecording(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId) extends IOutMessage

// Chat
case class GetChatHistoryReply(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId,
  replyTo: String, history: Array[Map[String, String]]) extends IOutMessage
case class SendPublicMessageEvent(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId,
  message: Map[String, String]) extends IOutMessage
case class SendPrivateMessageEvent(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId,
  message: Map[String, String]) extends IOutMessage

// Layout
case class GetCurrentLayoutReply(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, layoutID: String,
  locked: Boolean, setByUserId: IntUserId) extends IOutMessage
case class BroadcastLayoutEvent(meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId,
  layoutID: String, locked: Boolean, setByUserId: IntUserId, applyTo: Array[UserVO]) extends IOutMessage
case class LockLayoutEvent(meetingId: IntMeetingId, recorded: Recorded, setById: IntUserId, locked: Boolean,
  applyTo: Array[UserVO]) extends IOutMessage

// Presentation
case class ClearPresentationOutMsg(
  meetingId: IntMeetingId, recorded: Recorded) extends IOutMessage
case class RemovePresentationOutMsg(
  meetingId: IntMeetingId, recorded: Recorded, presentationId: PresentationId) extends IOutMessage
case class GetPresentationInfoOutMsg(meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId,
  info: CurrentPresentationInfo, replyTo: ReplyTo) extends IOutMessage
case class SendCursorUpdateOutMsg(
  meetingId: IntMeetingId, recorded: Recorded, xPercent: Double, yPercent: Double) extends IOutMessage
case class ResizeAndMoveSlideOutMsg(
  meetingId: IntMeetingId, recorded: Recorded, page: Page) extends IOutMessage
case class GotoSlideOutMsg(
  meetingId: IntMeetingId, recorded: Recorded, page: Page) extends IOutMessage
case class SharePresentationOutMsg(
  meetingId: IntMeetingId, recorded: Recorded, presentation: Presentation) extends IOutMessage
case class GetSlideInfoOutMsg(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, page: Page, replyTo: String) extends IOutMessage
case class GetPreuploadedPresentationsOutMsg(
  meetingId: IntMeetingId, recorded: Recorded) extends IOutMessage
case class PresentationConversionProgress(
  meetingId: IntMeetingId, messageKey: String, code: String,
  presentationId: PresentationId, presentationName: String) extends IOutMessage
case class PresentationConversionError(
  meetingId: IntMeetingId, messageKey: String, code: String,
  presentationId: PresentationId, numberOfPages: Int, maxNumberPages: Int, presentationName: String) extends IOutMessage
case class PresentationPageGenerated(
  meetingId: IntMeetingId, messageKey: String, code: String, presentationId: PresentationId,
  numberOfPages: Int, pagesCompleted: Int, presentationName: String) extends IOutMessage
case class PresentationConversionDone(
  meetingId: IntMeetingId, recorded: Recorded, messageKey: String, code: String,
  presentation: Presentation) extends IOutMessage
case class PresentationChanged(
  meetingId: IntMeetingId, presentation: Presentation) extends IOutMessage
case class GetPresentationStatusReply(
  meetingId: IntMeetingId, presentations: Seq[Presentation], current: Presentation, replyTo: String) extends IOutMessage
case class PresentationRemoved(
  meetingId: IntMeetingId, presentationId: String) extends IOutMessage
case class PageChanged(
  meetingId: IntMeetingId, page: Page) extends IOutMessage

// Polling
//case class PollCreatedMessage(meetingID: String, recorded: Boolean, requesterId: String, pollId: String, poll: PollVO) extends IOutMessage
//case class CreatePollReplyMessage(meetingID: String, recorded: Boolean, result: RequestResult, requesterId: String, pollId: String, pollType: String) extends IOutMessage
case class PollStartedMessage(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, pollId: String, poll: SimplePollOutVO) extends IOutMessage
case class PollStoppedMessage(
  meetingId: IntMeetingId, recorded: Recorded,
  requesterId: IntUserId, pollId: String) extends IOutMessage
case class PollShowResultMessage(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, pollId: String, poll: SimplePollResultOutVO) extends IOutMessage
case class PollHideResultMessage(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, pollId: String) extends IOutMessage
case class UserRespondedToPollMessage(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, pollId: String, poll: SimplePollResultOutVO) extends IOutMessage
case class GetCurrentPollReplyMessage(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, hasPoll: Boolean, poll: Option[PollVO]) extends IOutMessage

// Whiteboard
case class GetWhiteboardShapesReply(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, whiteboardId: String, shapes: Array[AnnotationVO], replyTo: String) extends IOutMessage
case class SendWhiteboardAnnotationEvent(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, whiteboardId: String, shape: AnnotationVO) extends IOutMessage
case class ClearWhiteboardEvent(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, whiteboardId: String) extends IOutMessage
case class UndoWhiteboardEvent(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, whiteboardId: String, shapeId: String) extends IOutMessage
case class WhiteboardEnabledEvent(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, enable: Boolean) extends IOutMessage
case class IsWhiteboardEnabledReply(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, enabled: Boolean, replyTo: String) extends IOutMessage
case class GetAllMeetingsReply(
  meetings: Array[MeetingInfo]) extends IOutMessage

// Chat
case class SendCaptionHistoryReply(
  meetingId: IntMeetingId, recorded: Recorded, requesterId: IntUserId, history: Map[String, Array[String]]) extends IOutMessage
case class UpdateCaptionOwnerReply(
  meetingId: IntMeetingId, recorded: Recorded, locale: String, ownerID: String) extends IOutMessage
case class EditCaptionHistoryReply(
  meetingId: IntMeetingId, recorded: Recorded, userID: String, startIndex: Integer, endIndex: Integer, locale: String, text: String) extends IOutMessage
// DeskShare
case class DeskShareStartRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareStopRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareNotifyViewersRTMP(meetingID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareNotifyASingleViewer(meetingID: String, userID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareHangUp(meetingID: String, fsConferenceName: String) extends IOutMessage

// Value Objects
case class MeetingVO(id: String, recorded: Recorded)

