package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.domain.{ Permissions, RegisteredUser, UserVO }
import org.bigbluebutton.core.messaging.Util
import com.google.gson.Gson
import collection.JavaConverters._
import scala.collection.JavaConversions._

object UsersMessageToJsonConverter {
  private def userToMap(user: UserVO): java.util.Map[String, Any] = {

    val wuser = new scala.collection.mutable.HashMap[String, Any]
    wuser += "userid" -> user.id.value
    wuser += "extern_userid" -> user.extId.value
    wuser += "name" -> user.name.value
    wuser += "role" -> user.roles.toString()
    wuser += "emoji_status" -> user.emojiStatus.value
    wuser += "presenter" -> user.presenter.value
    wuser += "has_stream" -> user.hasStream.value
    wuser += "locked" -> user.locked.value
    wuser += "webcam_stream" -> user.webcamStreams.toArray
    wuser += "phone_user" -> user.phoneUser.value
    wuser += "listenOnly" -> user.listenOnly.value

    val vuser = new scala.collection.mutable.HashMap[String, Any]
    vuser += "userid" -> user.voiceUser.id.value
    vuser += "web_userid" -> user.voiceUser.webUserId.value
    vuser += "callername" -> user.voiceUser.callerId.name.value
    vuser += "callernum" -> user.voiceUser.callerId.number.value
    vuser += "joined" -> user.voiceUser.joinedVoice.value
    vuser += "locked" -> user.voiceUser.locked.value
    vuser += "muted" -> user.voiceUser.muted.value
    vuser += "talking" -> user.voiceUser.talking.value

    wuser.put("voiceUser", mapAsJavaMap(vuser))

    mapAsJavaMap(wuser)
  }

  private def registeredUserToMap(user: RegisteredUser): java.util.Map[String, Any] = {
    val wuser = new scala.collection.mutable.HashMap[String, Any]
    wuser += "userid" -> user.id.value
    wuser += "extern_userid" -> user.extId.value
    wuser += "name" -> user.name.value
    wuser += "role" -> user.roles.toArray
    wuser += "authToken" -> user.authToken.value

    mapAsJavaMap(wuser)
  }

  private def buildPermissionsHashMap(perms: Permissions): java.util.HashMap[String, java.lang.Boolean] = {
    val args = new java.util.HashMap[String, java.lang.Boolean]()
    args.put("disableCam", perms.disableCam: java.lang.Boolean)
    args.put("disableMic", perms.disableMic: java.lang.Boolean)
    args.put("disablePrivateChat", perms.disablePrivChat: java.lang.Boolean)
    args.put("disablePublicChat", perms.disablePubChat: java.lang.Boolean)
    args.put("lockedLayout", perms.lockedLayout: java.lang.Boolean)
    args.put("lockOnJoin", perms.lockOnJoin: java.lang.Boolean)
    args.put("lockOnJoinConfigurable", perms.lockOnJoinConfigurable: java.lang.Boolean)
    args
  }

  def meetingState(msg: GetMeetingStateReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.PERMISSIONS, buildPermissionsHashMap(msg.permissions))
    payload.put(Constants.MEETING_MUTED, msg.meetingMuted: java.lang.Boolean)
    payload.put(Constants.USER_ID, msg.userId)

    val header = Util.buildHeader(MessageNames.MEETING_STATE, None)
    Util.buildJson(header, payload)
  }

  def meetingMuted(msg: MeetingMuted): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.MEETING_MUTED, msg.meetingMuted: java.lang.Boolean)

    val header = Util.buildHeader(MessageNames.MEETING_MUTED, None)
    Util.buildJson(header, payload)
  }

  def meetingHasEnded(msg: MeetingHasEnded): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)

    val header = Util.buildHeader(MessageNames.MEETING_HAS_ENDED, None)
    Util.buildJson(header, payload)
  }

  def meetingEnded(msg: MeetingEnded): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)

    val header = Util.buildHeader(MessageNames.MEETING_ENDED, None)
    Util.buildJson(header, payload)
  }

  def disconnectAllUsersToJson(msg: DisconnectAllUsers): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)

    val header = Util.buildHeader(MessageNames.DISCONNECT_ALL_USERS, None)
    Util.buildJson(header, payload)
  }

  def disconnectUserToJson(msg: DisconnectUser): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER_ID, msg.userId.value)

    val header = Util.buildHeader(MessageNames.DISCONNECT_USER, None)
    Util.buildJson(header, payload)
  }

  def sendUserEjectedFromMeetingToJson(msg: UserEjectedFromMeeting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.EJECTED_BY, msg.ejectedBy.value)

    val header = Util.buildHeader(MessageNames.USER_EJECTED_FROM_MEETING, None)
    Util.buildJson(header, payload)
  }

  def permissionsSettingInitializedToJson(msg: PermissionsSettingInitialized): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.SETTINGS, msg.permissions.toString()) //#todo not tested

    val header = Util.buildHeader(MessageNames.PERMISSION_SETTING_INITIALIZED, None)
    Util.buildJson(header, payload)
  }

  def newPermissionsSettingToJson(msg: NewPermissionsSetting): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.PERMISSIONS, buildPermissionsHashMap(msg.permissions))

    val users = new java.util.ArrayList[java.util.Map[String, Any]]
    msg.applyTo.foreach(uvo => {
      users.add(userToMap(uvo))
    })

    payload.put("users", users)

    val header = Util.buildHeader(MessageNames.NEW_PERMISSION_SETTINGS, None)
    Util.buildJson(header, payload)
  }

  def userLockedToJson(msg: UserLocked): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.LOCKED, msg.lock)

    val header = Util.buildHeader(MessageNames.USER_LOCKED, None)
    Util.buildJson(header, payload)
  }

  def getPermissionsSettingReplyToJson(msg: GetPermissionsSettingReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER_ID, msg.userId)

    val header = Util.buildHeader(MessageNames.GET_PERMISSION_SETTINGS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def userRegisteredToJson(msg: UserRegistered): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER, registeredUserToMap(msg.user))
    payload.put(Constants.RECORDED, msg.recorded.value)

    val header = Util.buildHeader(MessageNames.USER_REGISTERED, None)
    Util.buildJson(header, payload)
  }

  def userChangedEmojiStatusToJson(msg: UserChangedEmojiStatus): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.EMOJI_STATUS, msg.emojiStatus)
    payload.put(Constants.USER_ID, msg.userId.value)

    val header = Util.buildHeader(MessageNames.USER_EMOJI_STATUS, None)
    Util.buildJson(header, payload)
  }

  def userStatusChangeToJson(msg: UserStatusChange): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.STATUS, msg.status)
    payload.put(Constants.VALUE, msg.value.toString)

    val header = Util.buildHeader(MessageNames.USER_STATUS_CHANGED, None)
    Util.buildJson(header, payload)
  }

  def userSharedWebcamToJson(msg: UserSharedWebcam): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.STREAM, msg.stream)

    val header = Util.buildHeader(MessageNames.USER_SHARED_WEBCAM, None)
    Util.buildJson(header, payload)
  }

  def userUnsharedWebcamToJson(msg: UserUnsharedWebcam): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.STREAM, msg.stream)

    val header = Util.buildHeader(MessageNames.USER_UNSHARED_WEBCAM, None)
    Util.buildJson(header, payload)
  }

  def broadcastLayout(msg: BroadcastLayoutEvent): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.REQUESTER_ID, msg.requesterId.value)

    val users = new java.util.ArrayList[String]
    msg.applyTo.foreach(uvo => {
      users.add(uvo.id.value)
    })

    payload.put(Constants.USERS, users)

    val header = Util.buildHeader(MessageNames.GET_USERS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def getUsersReplyToJson(msg: GetUsersReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.REQUESTER_ID, msg.requesterId.value)

    val users = new java.util.ArrayList[java.util.Map[String, Any]]
    msg.users.foreach(uvo => {
      users.add(userToMap(uvo))
    })

    payload.put(Constants.USERS, users)

    val header = Util.buildHeader(MessageNames.GET_USERS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def userJoinedVoice(msg: UserJoinedVoice): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

    val header = Util.buildHeader(MessageNames.USER_JOINED_VOICE, None)
    Util.buildJson(header, payload)
  }

  def userVoiceMuted(msg: UserVoiceMuted): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

    val header = Util.buildHeader(MessageNames.USER_VOICE_MUTED, None)
    Util.buildJson(header, payload)
  }

  def userVoiceTalking(msg: UserVoiceTalking): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum.value)

    val header = Util.buildHeader(MessageNames.USER_VOICE_TALKING, None)
    Util.buildJson(header, payload)
  }

  def muteVoiceUserToJson(msg: MuteVoiceUser): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.MUTE, msg.mute)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.REQUESTER_ID, msg.requesterId.value)
    payload.put(Constants.VOICE_CONF_ID, msg.voiceConfId.value)
    payload.put(Constants.VOICE_USER_ID, msg.voiceUserId.value)

    val header = Util.buildHeader(MessageNames.EJECT_VOICE_USER, None)
    Util.buildJson(header, payload)
  }

  def ejectVoiceUserToJson(msg: EjectVoiceUser): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.REQUESTER_ID, msg.requesterId.value)
    payload.put(Constants.VOICE_CONF_ID, msg.voiceConfId.value)
    payload.put(Constants.VOICE_USER_ID, msg.voiceUserId.value)

    val header = Util.buildHeader(MessageNames.EJECT_VOICE_USER, None)
    Util.buildJson(header, payload)
  }

  def userLeftVoiceToJson(msg: UserLeftVoice): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

    val header = Util.buildHeader(MessageNames.USER_LEFT_VOICE, None)
    Util.buildJson(header, payload)
  }

  def isMeetingMutedReplyToJson(msg: IsMeetingMutedReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.REQUESTER_ID, msg.requesterId.value)
    payload.put(Constants.MUTED, msg.meetingMuted)

    val header = Util.buildHeader(MessageNames.IS_MEETING_MUTED_REPLY, None)
    Util.buildJson(header, payload)
  }

  def recordingStatusChangedToJson(msg: RecordingStatusChanged): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.RECORDING_STATUS_CHANGED, None)
    Util.buildJson(header, payload)
  }

  def getRecordingStatusReplyToJson(msg: GetRecordingStatusReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.GET_RECORDING_STATUS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def validateAuthTokenReplyToJson(msg: ValidateAuthTokenReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.REPLY_TO, msg.correlationId)
    payload.put(Constants.VALID, msg.valid.toString)
    payload.put(Constants.USER_ID, msg.requesterId.value)
    payload.put(Constants.AUTH_TOKEN, msg.token.value)
    payload.put(Constants.MEETING_ID, msg.meetingId.value)

    val header = Util.buildHeader(MessageNames.VALIDATE_AUTH_TOKEN_REPLY, None)
    Util.buildJson(header, payload)
  }

  def validateAuthTokenTimeoutToJson(msg: ValidateAuthTokenTimedOut): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.REPLY_TO, msg.correlationId)
    payload.put(Constants.VALID, msg.valid.toString)
    payload.put(Constants.AUTH_TOKEN, msg.token)
    payload.put(Constants.USER_ID, msg.requesterId)
    payload.put(Constants.MEETING_ID, msg.meetingId.value)

    val header = Util.buildHeader(MessageNames.VALIDATE_AUTH_TOKEN_TIMEOUT, None)
    Util.buildJson(header, payload)
  }

  def userJoinedToJson(msg: UserJoined): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_JOINED, None)
    Util.buildJson(header, payload)
  }

  def userLeftToJson(msg: UserLeft): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_LEFT, None)
    Util.buildJson(header, payload)
  }

  def presenterAssignedToJson(msg: PresenterAssigned): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.NEW_PRESENTER_ID, msg.presenter.id.value)
    payload.put(Constants.NEW_PRESENTER_NAME, msg.presenter.name.value)
    payload.put(Constants.ASSIGNED_BY, msg.presenter.assignedBy.value)
    payload.put(Constants.RECORDED, msg.recorded.value)

    val header = Util.buildHeader(MessageNames.PRESENTER_ASSIGNED, None)
    Util.buildJson(header, payload)
  }

  def endAndKickAllToJson(msg: EndAndKickAll): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded)

    val header = Util.buildHeader(MessageNames.END_AND_KICK_ALL, None)
    Util.buildJson(header, payload)
  }

  def userListeningOnlyToJson(msg: UserListeningOnly): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.LISTEN_ONLY, msg.listenOnly)

    val header = Util.buildHeader(MessageNames.USER_LISTEN_ONLY, None)
    Util.buildJson(header, payload)
  }
}
