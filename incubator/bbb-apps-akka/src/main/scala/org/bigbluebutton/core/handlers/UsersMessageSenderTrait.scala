package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.api.{ MeetingHasEnded, PresenterAssigned, UserVoiceTalking, _ }
import org.bigbluebutton.core.domain.{ EmojiStatus, Locked, Muted, Presenter, _ }

trait UsersMessageSenderTrait {
  def sendUserListeningOnlyMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    listenOnly: ListenOnly): Unit

  def sendMuteVoiceUserMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    requesterId: IntUserId,
    voiceId: VoiceUserId,
    voiceBridge: VoiceConf,
    mute: Boolean): Unit

  def sendMeetingMutedMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    muted: Boolean): Unit

  def sendValidateAuthTokenReplyMessage(
    meetingId: IntMeetingId,
    userId: IntUserId,
    authToken: AuthToken,
    valid: Boolean,
    correlationId: String): Unit

  def sendUserRegisteredMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    regUser: RegisteredUser): Unit

  def sendIsMeetingMutedReplyMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    requesterId: IntUserId,
    muted: Boolean): Unit

  def sendEjectVoiceUserMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    ejectedBy: IntUserId,
    userId: IntUserId,
    voiceId: VoiceUserId,
    voiceConf: VoiceConf): Unit

  def sendNewPermissionsSettingMessage(
    meetingId: IntMeetingId,
    userId: IntUserId,
    permissions: Permissions,
    users: Array[UserVO]): Unit

  def sendUserLockedMessage(
    meetingId: IntMeetingId,
    userId: IntUserId,
    lock: Locked): Unit

  def sendPermissionsSettingInitializedMessage(
    meetingId: IntMeetingId,
    permissions: Permissions,
    users: Array[UserVO]): Unit

  def sendUserChangedEmojiStatusMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    emojiStatus: EmojiStatus,
    userId: IntUserId): Unit

  def sendUserEjectedFromMeetingMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    ejectedBy: IntUserId): Unit

  def sendDisconnectUserMessage(
    meetingId: IntMeetingId,
    userId: IntUserId): Unit

  def sendUserLeftMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    user: UserVO): Unit

  def sendUserSharedWebcamMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    stream: String): Unit

  def sendUserUnsharedWebcamMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    stream: String): Unit

  def sendUserStatusChangeMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    status: String,
    value: Object): Unit

  def sendGetUsersReplyMessage(
    meetingId: IntMeetingId,
    requesterId: IntUserId,
    users: Array[UserVO]): Unit

  def sendUserJoinedMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    user: UserVO): Unit

  def sendMeetingStateMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    permissions: Permissions,
    muted: Muted): Unit

  def sendUserLeftVoiceMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    voiceConf: VoiceConf,
    user: UserVO): Unit

  def sendUserJoinedVoiceMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    voiceBridge: VoiceConf,
    user: UserVO): Unit

  def sendStartRecordingVoiceConf(
    meetingId: IntMeetingId,
    recorded: Recorded,
    voiceBridge: VoiceConf): Unit

  def sendStopRecordingVoiceConf(
    meetingId: IntMeetingId,
    recorded: Recorded,
    voiceConf: VoiceConf,
    recordingFile: String): Unit

  def sendUserVoiceMutedMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    voiceBridge: VoiceConf,
    user: UserVO): Unit

  def sendUserVoiceTalkingMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    voiceBridge: VoiceConf,
    user: UserVO): Unit

  def sendUserStatusChangeMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    userId: IntUserId,
    isPresenter: Boolean): Unit

  def sendPresenterAssignedMessage(
    meetingId: IntMeetingId,
    recorded: Recorded,
    presenter: Presenter): Unit

  def sendMeetingHasEnded(
    meetingId: IntMeetingId,
    userId: IntUserId): Unit
}
