package org.bigbluebutton.core.api

import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models._
import org.bigbluebutton.common2.domain.UserVO
import org.bigbluebutton.common2.msgs.{ BreakoutRoomInfo, BreakoutUserVO }

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
case class InactivityWarning(meetingID: String, duration: Long) extends IOutMessage
case class MeetingIsActive(meetingID: String) extends IOutMessage
case class DisconnectUser(meetingID: String, userId: String) extends IOutMessage
case class KeepAliveMessageReply(aliveID: String) extends IOutMessage
case class PubSubPong(system: String, timestamp: Long) extends IOutMessage
case object IsAliveMessage extends IOutMessage

// Permissions
case class PermissionsSettingInitialized(meetingID: String, permissions: Permissions, applyTo: Array[UserVO]) extends IOutMessage
case class NewPermissionsSetting(meetingID: String, setByUser: String, permissions: Permissions, applyTo: Vector[UserState]) extends IOutMessage
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
case class UserSharedWebcam(meetingID: String, recorded: Boolean, userID: String, stream: String) extends IOutMessage
case class UserUnsharedWebcam(meetingID: String, recorded: Boolean, userID: String, stream: String) extends IOutMessage
case class UserStatusChange(meetingID: String, recorded: Boolean, userID: String, status: String, value: Object) extends IOutMessage
case class UserRoleChange(meetingID: String, recorded: Boolean, userID: String, role: String) extends IOutMessage
case class TransferUserToMeeting(voiceConfId: String, targetVoiceConfId: String, userId: String) extends IOutMessage
case class AllowUserToShareDesktopOut(meetingID: String, userID: String, allowed: Boolean) extends IOutMessage

// No idea what part this is for
case class GetAllMeetingsReply(meetings: Array[MeetingInfo]) extends IOutMessage

// DeskShare
case class DeskShareStartRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareStopRTMPBroadcast(conferenceName: String, streamPath: String) extends IOutMessage
case class DeskShareNotifyViewersRTMP(meetingID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareNotifyASingleViewer(meetingID: String, userID: String, streamPath: String, videoWidth: Int, videoHeight: Int, broadcasting: Boolean) extends IOutMessage
case class DeskShareHangUp(meetingID: String, fsConferenceName: String) extends IOutMessage

// Guest
case class GetGuestPolicyReply(meetingID: String, recorded: Boolean, requesterID: String, policy: String) extends IOutMessage
case class GuestPolicyChanged(meetingID: String, recorded: Boolean, policy: String) extends IOutMessage
case class GuestAccessDenied(meetingID: String, recorded: Boolean, userId: String) extends IOutMessage

// Value Objects
case class MeetingVO(id: String, recorded: Boolean)
