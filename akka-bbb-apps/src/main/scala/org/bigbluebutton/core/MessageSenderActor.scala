package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.Props
import akka.actor.OneForOneStrategy
import akka.actor.SupervisorStrategy.Resume
import java.io.{ PrintWriter, StringWriter }
import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.common.messages.StartRecordingVoiceConfRequestMessage
import org.bigbluebutton.common.messages.StopRecordingVoiceConfRequestMessage
import org.bigbluebutton.core.pubsub.senders.MeetingMessageToJsonConverter
import org.bigbluebutton.common.messages.AllowUserToShareDesktopReply
import scala.collection.JavaConversions._
import scala.concurrent.duration._
import org.bigbluebutton.core.pubsub.senders.UsersMessageToJsonConverter
import org.bigbluebutton.common.messages.GetUsersFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.MuteUserInVoiceConfRequestMessage
import org.bigbluebutton.common.messages.EjectUserFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.GetCurrentLayoutReplyMessage
import org.bigbluebutton.common.messages.BroadcastLayoutMessage
import org.bigbluebutton.common.messages.UserEjectedFromMeetingMessage
import org.bigbluebutton.common.messages.LockLayoutMessage
import org.bigbluebutton.common.converters.ToJsonEncoder
import org.bigbluebutton.common.messages.TransferUserToVoiceConfRequestMessage
import scala.collection.JavaConverters

object MessageSenderActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[MessageSenderActor], msgSender)
}

class MessageSenderActor(val service: MessageSender)
    extends Actor with ActorLogging {

  override val supervisorStrategy = OneForOneStrategy(maxNrOfRetries = 10, withinTimeRange = 1 minute) {
    case e: Exception => {
      val sw: StringWriter = new StringWriter()
      sw.write("An exception has been thrown on MessageSenderActor, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
      e.printStackTrace(new PrintWriter(sw))
      log.error(sw.toString())
      Resume
    }
  }

  val encoder = new ToJsonEncoder()
  def receive = {
    case msg: UserEjectedFromMeeting => handleUserEjectedFromMeeting(msg)
    case msg: MeetingCreated => handleMeetingCreated(msg)
    case msg: VoiceRecordingStarted => handleVoiceRecordingStarted(msg)
    case msg: VoiceRecordingStopped => handleVoiceRecordingStopped(msg)
    case msg: RecordingStatusChanged => handleRecordingStatusChanged(msg)
    case msg: GetRecordingStatusReply => handleGetRecordingStatusReply(msg)
    case msg: MeetingEnding => handleMeetingEnding(msg)
    case msg: MeetingEnded => handleMeetingEnded(msg)
    case msg: MeetingHasEnded => handleMeetingHasEnded(msg)
    case msg: MeetingDestroyed => handleMeetingDestroyed(msg)
    case msg: KeepAliveMessageReply => handleKeepAliveMessageReply(msg)
    case msg: PubSubPong => handlePubSubPong(msg)
    case msg: InactivityWarning => handleInactivityWarning(msg)
    case msg: MeetingIsActive => handleMeetingIsActive(msg)
    case msg: StartRecording => handleStartRecording(msg)
    case msg: StopRecording => handleStopRecording(msg)
    case msg: GetAllMeetingsReply => handleGetAllMeetingsReply(msg)
    case msg: StartRecordingVoiceConf => handleStartRecordingVoiceConf(msg)
    case msg: StopRecordingVoiceConf => handleStopRecordingVoiceConf(msg)
    case msg: MeetingMuted => handleMeetingMuted(msg)
    case msg: MeetingState => handleMeetingState(msg)
    case msg: DisconnectAllUsers => handleDisconnectAllUsers(msg)
    case msg: AllowUserToShareDesktopOut => handleAllowUserToShareDesktopOut(msg)
    case msg: DisconnectUser => handleDisconnectUser(msg)
    case msg: PermissionsSettingInitialized => handlePermissionsSettingInitialized(msg)
    case msg: NewPermissionsSetting => handleNewPermissionsSetting(msg)
    case msg: UserLocked => handleUserLocked(msg)
    case msg: GetPermissionsSettingReply => handleGetPermissionsSettingReply(msg)
    case msg: UserRegistered => handleUserRegistered(msg)
    case msg: UserLeft => handleUserLeft(msg)
    case msg: PresenterAssigned => handlePresenterAssigned(msg)
    case msg: EndAndKickAll => handleEndAndKickAll(msg)
    case msg: GetUsersReply => handleGetUsersReply(msg)
    case msg: ValidateAuthTokenReply => handleValidateAuthTokenReply(msg)
    case msg: ValidateAuthTokenTimedOut => handleValidateAuthTokenTimedOut(msg)
    case msg: UserJoined => handleUserJoined(msg)
    case msg: UserChangedEmojiStatus => handleChangedUserEmojiStatus(msg)
    case msg: UserSharedWebcam => handleUserSharedWebcam(msg)
    case msg: UserUnsharedWebcam => handleUserUnsharedWebcam(msg)
    case msg: UserStatusChange => handleUserStatusChange(msg)
    case msg: UserRoleChange => handleUserRoleChange(msg)
    case msg: UserVoiceMuted => handleUserVoiceMuted(msg)
    case msg: UserVoiceTalking => handleUserVoiceTalking(msg)
    case msg: MuteVoiceUser => handleMuteVoiceUser(msg)
    case msg: EjectVoiceUser => handleEjectVoiceUser(msg)
    case msg: TransferUserToMeeting => handleTransferUserToMeeting(msg)
    case msg: GetUsersInVoiceConference => handleGetUsersFromVoiceConference(msg)
    case msg: UserJoinedVoice => handleUserJoinedVoice(msg)
    case msg: UserLeftVoice => handleUserLeftVoice(msg)
    case msg: IsMeetingMutedReply => handleIsMeetingMutedReply(msg)
    case msg: UserListeningOnly => handleUserListeningOnly(msg)
    case msg: GetCurrentLayoutReply => handleGetCurrentLayoutReply(msg)
    case msg: BroadcastLayoutEvent => handleBroadcastLayoutEvent(msg)
    case msg: LockLayoutEvent => handleLockLayoutEvent(msg)
    // breakout room cases
    case msg: BreakoutRoomsListOutMessage => handleBreakoutRoomsListOutMessage(msg)
    case msg: BreakoutRoomStartedOutMessage => handleBreakoutRoomStartedOutMessage(msg)
    case msg: BreakoutRoomEndedOutMessage => handleBreakoutRoomEndedOutMessage(msg)
    case msg: BreakoutRoomJoinURLOutMessage => handleBreakoutRoomJoinURLOutMessage(msg)
    case msg: UpdateBreakoutUsersOutMessage => handleUpdateBreakoutUsersOutMessage(msg)
    case msg: MeetingTimeRemainingUpdate => handleMeetingTimeRemainingUpdate(msg)
    case msg: BreakoutRoomsTimeRemainingUpdateOutMessage => handleBreakoutRoomsTimeRemainingUpdate(msg)

    case msg: GetGuestPolicyReply => handleGetGuestPolicyReply(msg)
    case msg: GuestPolicyChanged => handleGuestPolicyChanged(msg)
    case msg: GuestAccessDenied => handleGuestAccessDenied(msg)
    case _ => // do nothing
  }

  private def handleUserEjectedFromMeeting(msg: UserEjectedFromMeeting) {
    val m = new UserEjectedFromMeetingMessage(msg.meetingID, msg.userId, msg.ejectedBy)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, m.toJson)
  }

  private def handleStartRecordingVoiceConf(msg: StartRecordingVoiceConf) {
    val m = new StartRecordingVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleStopRecordingVoiceConf(msg: StopRecordingVoiceConf) {
    val m = new StopRecordingVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.recordedStream)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleMeetingDestroyed(msg: MeetingDestroyed) {
    val json = MeetingMessageToJsonConverter.meetingDestroyedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handlePubSubPong(msg: PubSubPong) {
    val json = encoder.encodePubSubPongMessage(msg.system, msg.timestamp)
    service.send(MessagingConstants.FROM_SYSTEM_CHANNEL, json)
  }

  private def handleKeepAliveMessageReply(msg: KeepAliveMessageReply) {
    val json = MeetingMessageToJsonConverter.keepAliveMessageReplyToJson(msg)
    service.send(MessagingConstants.FROM_SYSTEM_CHANNEL, json)
  }

  private def handleMeetingCreated(msg: MeetingCreated) {
    val json = MeetingMessageToJsonConverter.meetingCreatedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingEnded(msg: MeetingEnded) {
    val json = MeetingMessageToJsonConverter.meetingEndedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.meetingEnded(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleMeetingEnding(msg: MeetingEnding) {
    val json = MeetingMessageToJsonConverter.meetingEndingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleStartRecording(msg: StartRecording) {
    val json = MeetingMessageToJsonConverter.startRecordingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleStopRecording(msg: StopRecording) {
    val json = MeetingMessageToJsonConverter.stopRecordingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleVoiceRecordingStarted(msg: VoiceRecordingStarted) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStartedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleVoiceRecordingStopped(msg: VoiceRecordingStopped) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStoppedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    val json = MeetingMessageToJsonConverter.recordingStatusChangedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.recordingStatusChangedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    val json = MeetingMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    val json = MeetingMessageToJsonConverter.meetingHasEndedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)

    val json2 = UsersMessageToJsonConverter.meetingHasEnded(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json2)
  }

  private def handleGetAllMeetingsReply(msg: GetAllMeetingsReply) {
    val json = MeetingMessageToJsonConverter.getAllMeetingsReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleInactivityWarning(msg: InactivityWarning) {
    val json = MeetingMessageToJsonConverter.inactivityWarningToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingIsActive(msg: MeetingIsActive) {
    val json = MeetingMessageToJsonConverter.meetingIsActiveToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleLockLayoutEvent(msg: LockLayoutEvent) {
    val users = new java.util.ArrayList[String];
    msg.applyTo.foreach(uvo => {
      users.add(uvo.id)
    })

    val evt = new LockLayoutMessage(msg.meetingID, msg.setById, msg.locked, users)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, evt.toJson())
  }

  private def handleBroadcastLayoutEvent(msg: BroadcastLayoutEvent) {
    val users = new java.util.ArrayList[String];
    msg.applyTo.foreach(uvo => {
      users.add(uvo.id)
    })

    val evt = new BroadcastLayoutMessage(msg.meetingID, msg.setByUserID, msg.layoutID, msg.locked, users)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, evt.toJson())
  }

  private def handleGetCurrentLayoutReply(msg: GetCurrentLayoutReply) {
    val reply = new GetCurrentLayoutReplyMessage(msg.meetingID, msg.requesterID, msg.setByUserID, msg.layoutID, msg.locked)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, reply.toJson())
  }

  private def handleMeetingState(msg: MeetingState) {
    val json = UsersMessageToJsonConverter.meetingState(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleMeetingMuted(msg: MeetingMuted) {
    val json = UsersMessageToJsonConverter.meetingMuted(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
    val json = UsersMessageToJsonConverter.disconnectAllUsersToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectUser(msg: DisconnectUser) {
    val json = UsersMessageToJsonConverter.disconnectUserToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleAllowUserToShareDesktopOut(msg: AllowUserToShareDesktopOut): Unit = {
    val obj = new AllowUserToShareDesktopReply(msg.meetingID, msg.userID, msg.allowed,
      TimestampGenerator.generateTimestamp)
    val json = obj.toJson()
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handlePermissionsSettingInitialized(msg: PermissionsSettingInitialized) {
    val json = UsersMessageToJsonConverter.permissionsSettingInitializedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
    val json = UsersMessageToJsonConverter.newPermissionsSettingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleUserLocked(msg: UserLocked) {
    val json = UsersMessageToJsonConverter.userLockedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleGetPermissionsSettingReply(msg: GetPermissionsSettingReply) {
    val json = UsersMessageToJsonConverter.getPermissionsSettingReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleUserRegistered(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
    handleRegisteredUser(msg);
  }

  private def handleUserStatusChange(msg: UserStatusChange) {
    val json = UsersMessageToJsonConverter.userStatusChangeToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserRoleChange(msg: UserRoleChange) {
    val json = UsersMessageToJsonConverter.userRoleChangeToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleChangedUserEmojiStatus(msg: UserChangedEmojiStatus) {
    val json = UsersMessageToJsonConverter.userChangedEmojiStatusToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    val json = UsersMessageToJsonConverter.userSharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    val json = UsersMessageToJsonConverter.userUnsharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGetUsersReply(msg: GetUsersReply) {
    val json = UsersMessageToJsonConverter.getUsersReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    val json = UsersMessageToJsonConverter.userJoinedVoice(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserVoiceMuted(msg: UserVoiceMuted) {
    val json = UsersMessageToJsonConverter.userVoiceMuted(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserVoiceTalking(msg: UserVoiceTalking) {
    val json = UsersMessageToJsonConverter.userVoiceTalking(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    val m = new MuteUserInVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.voiceUserId, msg.mute)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleGetUsersFromVoiceConference(msg: GetUsersInVoiceConference) {
    val m = new GetUsersFromVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val m = new EjectUserFromVoiceConfRequestMessage(msg.meetingID, msg.voiceConfId, msg.voiceUserId)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleTransferUserToMeeting(msg: TransferUserToMeeting) {
    val m = new TransferUserToVoiceConfRequestMessage(msg.voiceConfId, msg.targetVoiceConfId, msg.userId);
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, m.toJson())
  }

  private def handleUserLeftVoice(msg: UserLeftVoice) {
    val json = UsersMessageToJsonConverter.userLeftVoiceToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
    val json = UsersMessageToJsonConverter.isMeetingMutedReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
    println("**** handleValidateAuthTokenReply *****")
    val json = UsersMessageToJsonConverter.validateAuthTokenReplyToJson(msg)
    //println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleValidateAuthTokenTimedOut(msg: ValidateAuthTokenTimedOut) {
    println("**** handleValidateAuthTokenTimedOut *****")
    val json = UsersMessageToJsonConverter.validateAuthTokenTimeoutToJson(msg)
    //println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserJoined(msg: UserJoined) {
    val json = UsersMessageToJsonConverter.userJoinedToJson(msg)
    //println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleRegisteredUser(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserLeft(msg: UserLeft) {
    val json = UsersMessageToJsonConverter.userLeftToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handlePresenterAssigned(msg: PresenterAssigned) {
    val json = UsersMessageToJsonConverter.presenterAssignedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleEndAndKickAll(msg: EndAndKickAll) {
    val json = UsersMessageToJsonConverter.endAndKickAllToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserListeningOnly(msg: UserListeningOnly) {
    val json = UsersMessageToJsonConverter.userListeningOnlyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomsListOutMessage(msg: BreakoutRoomsListOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomsListOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomStartedOutMessage(msg: BreakoutRoomStartedOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomStartedOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomEndedOutMessage(msg: BreakoutRoomEndedOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomEndedOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomJoinURLOutMessage(msg: BreakoutRoomJoinURLOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomJoinURLOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUpdateBreakoutUsersOutMessage(msg: UpdateBreakoutUsersOutMessage) {
    val json = MeetingMessageToJsonConverter.updateBreakoutUsersOutMessageToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleMeetingTimeRemainingUpdate(msg: MeetingTimeRemainingUpdate) {
    val json = MeetingMessageToJsonConverter.meetingTimeRemainingUpdateToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleBreakoutRoomsTimeRemainingUpdate(msg: BreakoutRoomsTimeRemainingUpdateOutMessage) {
    val json = MeetingMessageToJsonConverter.breakoutRoomsTimeRemainingUpdateToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGetGuestPolicyReply(msg: GetGuestPolicyReply) {
    val json = UsersMessageToJsonConverter.getGuestPolicyReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGuestPolicyChanged(msg: GuestPolicyChanged) {
    val json = UsersMessageToJsonConverter.guestPolicyChangedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGuestAccessDenied(msg: GuestAccessDenied) {
    val json = UsersMessageToJsonConverter.guestAccessDeniedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
}
