package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.messaging.Util
import com.google.gson.Gson
import org.bigbluebutton.core.api.UserVO
import collection.JavaConverters._
import scala.collection.JavaConversions._

object UsersMessageToJsonConverter {
  private def userToMap(user: UserVO): java.util.Map[String, Any] = {

    val wuser = new scala.collection.mutable.HashMap[String, Any]
    wuser += "userid" -> user.userID
    wuser += "extern_userid" -> user.externUserID
    wuser += "name" -> user.name
    wuser += "role" -> user.role.toString()
    wuser += "emoji_status" -> user.emojiStatus
    wuser += "presenter" -> user.presenter
    wuser += "has_stream" -> user.hasStream
    wuser += "locked" -> user.locked
    wuser += "webcam_stream" -> user.webcamStreams.toArray
    wuser += "phone_user" -> user.phoneUser
    wuser += "listenOnly" -> user.listenOnly
    wuser += "avatarURL" -> user.avatarURL

    val vuser = new scala.collection.mutable.HashMap[String, Any]
    vuser += "userid" -> user.voiceUser.userId
    vuser += "web_userid" -> user.voiceUser.webUserId
    vuser += "callername" -> user.voiceUser.callerName
    vuser += "callernum" -> user.voiceUser.callerNum
    vuser += "joined" -> user.voiceUser.joined
    vuser += "locked" -> user.voiceUser.locked
    vuser += "muted" -> user.voiceUser.muted
    vuser += "talking" -> user.voiceUser.talking

    wuser.put("voiceUser", mapAsJavaMap(vuser))

    mapAsJavaMap(wuser)
  }

  private def registeredUserToMap(user: RegisteredUser): java.util.Map[String, Any] = {
    val wuser = new scala.collection.mutable.HashMap[String, Any]
    wuser += "userid" -> user.id
    wuser += "extern_userid" -> user.externId
    wuser += "name" -> user.name
    wuser += "role" -> user.role.toString()
    wuser += "authToken" -> user.authToken
    wuser += "avatarURL" -> user.avatarURL

    mapAsJavaMap(wuser)
  }

  private def buildPermissionsHashMap(perms: Permissions): java.util.HashMap[String, java.lang.Boolean] = {
    val args = new java.util.HashMap[String, java.lang.Boolean]();
    args.put("disableCam", perms.disableCam: java.lang.Boolean);
    args.put("disableMic", perms.disableMic: java.lang.Boolean);
    args.put("disablePrivateChat", perms.disablePrivChat: java.lang.Boolean);
    args.put("disablePublicChat", perms.disablePubChat: java.lang.Boolean);
    args.put("lockedLayout", perms.lockedLayout: java.lang.Boolean);
    args.put("lockOnJoin", perms.lockOnJoin: java.lang.Boolean);
    args.put("lockOnJoinConfigurable", perms.lockOnJoinConfigurable: java.lang.Boolean);
    args
  }

  def meetingState(msg: MeetingState): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PERMISSIONS, buildPermissionsHashMap(msg.permissions))
    payload.put(Constants.MEETING_MUTED, msg.meetingMuted: java.lang.Boolean);
    payload.put(Constants.USER_ID, msg.userId);

    val header = Util.buildHeader(MessageNames.MEETING_STATE, None)
    Util.buildJson(header, payload)
  }

  def meetingMuted(msg: MeetingMuted): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MEETING_MUTED, msg.meetingMuted: java.lang.Boolean);

    val header = Util.buildHeader(MessageNames.MEETING_MUTED, None)
    Util.buildJson(header, payload)
  }

  def meetingHasEnded(msg: MeetingHasEnded): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.MEETING_HAS_ENDED, None)
    Util.buildJson(header, payload)
  }

  def meetingEnded(msg: MeetingEnded): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.MEETING_ENDED, None)
    Util.buildJson(header, payload)
  }

  def disconnectAllUsersToJson(msg: DisconnectAllUsers): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.DISCONNECT_ALL_USERS, None)
    Util.buildJson(header, payload)
  }

  def disconnectUserToJson(msg: DisconnectUser): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)

    val header = Util.buildHeader(MessageNames.DISCONNECT_USER, None)
    Util.buildJson(header, payload)
  }

  def sendUserEjectedFromMeetingToJson(msg: UserEjectedFromMeeting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.EJECTED_BY, msg.ejectedBy)

    val header = Util.buildHeader(MessageNames.USER_EJECTED_FROM_MEETING, None)
    Util.buildJson(header, payload)
  }

  def permissionsSettingInitializedToJson(msg: PermissionsSettingInitialized): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.SETTINGS, msg.permissions.toString()) //#todo not tested

    val header = Util.buildHeader(MessageNames.PERMISSION_SETTING_INITIALIZED, None)
    Util.buildJson(header, payload)
  }

  def newPermissionsSettingToJson(msg: NewPermissionsSetting): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
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
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.LOCKED, msg.lock)

    val header = Util.buildHeader(MessageNames.USER_LOCKED, None)
    Util.buildJson(header, payload)
  }

  def getPermissionsSettingReplyToJson(msg: GetPermissionsSettingReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)

    val header = Util.buildHeader(MessageNames.GET_PERMISSION_SETTINGS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def userRegisteredToJson(msg: UserRegistered): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER, registeredUserToMap(msg.user))
    payload.put(Constants.RECORDED, msg.recorded)

    val header = Util.buildHeader(MessageNames.USER_REGISTERED, None)
    Util.buildJson(header, payload)
  }

  def userChangedEmojiStatusToJson(msg: UserChangedEmojiStatus): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.EMOJI_STATUS, msg.emojiStatus)
    payload.put(Constants.USER_ID, msg.userID)

    val header = Util.buildHeader(MessageNames.USER_EMOJI_STATUS, None)
    Util.buildJson(header, payload)
  }

  def userStatusChangeToJson(msg: UserStatusChange): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STATUS, msg.status)
    payload.put(Constants.VALUE, msg.value.toString)

    val header = Util.buildHeader(MessageNames.USER_STATUS_CHANGED, None)
    Util.buildJson(header, payload)
  }

  def userSharedWebcamToJson(msg: UserSharedWebcam): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)

    val header = Util.buildHeader(MessageNames.USER_SHARED_WEBCAM, None)
    Util.buildJson(header, payload)
  }

  def userUnsharedWebcamToJson(msg: UserUnsharedWebcam): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)

    val header = Util.buildHeader(MessageNames.USER_UNSHARED_WEBCAM, None)
    Util.buildJson(header, payload)
  }

  def broadcastLayout(msg: BroadcastLayoutEvent): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val users = new java.util.ArrayList[String];
    msg.applyTo.foreach(uvo => {
      users.add(uvo.userID)
    })

    payload.put(Constants.USERS, users)

    val header = Util.buildHeader(MessageNames.GET_USERS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def getUsersReplyToJson(msg: GetUsersReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val users = new java.util.ArrayList[java.util.Map[String, Any]];
    msg.users.foreach(uvo => {
      users.add(userToMap(uvo))
    })

    payload.put(Constants.USERS, users)

    val header = Util.buildHeader(MessageNames.GET_USERS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def userJoinedVoice(msg: UserJoinedVoice): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

    val header = Util.buildHeader(MessageNames.USER_JOINED_VOICE, None)
    Util.buildJson(header, payload)
  }

  def userVoiceMuted(msg: UserVoiceMuted): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

    val header = Util.buildHeader(MessageNames.USER_VOICE_MUTED, None)
    Util.buildJson(header, payload)
  }

  def userVoiceTalking(msg: UserVoiceTalking): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

    val header = Util.buildHeader(MessageNames.USER_VOICE_TALKING, None)
    Util.buildJson(header, payload)
  }

  def muteVoiceUserToJson(msg: MuteVoiceUser): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MUTE, msg.mute)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.VOICE_CONF_ID, msg.voiceConfId)
    payload.put(Constants.VOICE_USER_ID, msg.voiceUserId)

    val header = Util.buildHeader(MessageNames.EJECT_VOICE_USER, None)
    Util.buildJson(header, payload)
  }

  def ejectVoiceUserToJson(msg: EjectVoiceUser): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.VOICE_CONF_ID, msg.voiceConfId)
    payload.put(Constants.VOICE_USER_ID, msg.voiceUserId)

    val header = Util.buildHeader(MessageNames.EJECT_VOICE_USER, None)
    Util.buildJson(header, payload)
  }

  def userLeftVoiceToJson(msg: UserLeftVoice): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

    val header = Util.buildHeader(MessageNames.USER_LEFT_VOICE, None)
    Util.buildJson(header, payload)
  }

  def isMeetingMutedReplyToJson(msg: IsMeetingMutedReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.MUTED, msg.meetingMuted)

    val header = Util.buildHeader(MessageNames.IS_MEETING_MUTED_REPLY, None)
    Util.buildJson(header, payload)
  }

  def recordingStatusChangedToJson(msg: RecordingStatusChanged): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.RECORDING_STATUS_CHANGED, None)
    Util.buildJson(header, payload)
  }

  def getRecordingStatusReplyToJson(msg: GetRecordingStatusReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.GET_RECORDING_STATUS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def validateAuthTokenReplyToJson(msg: ValidateAuthTokenReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.REPLY_TO, msg.correlationId)
    payload.put(Constants.VALID, msg.valid.toString)
    payload.put(Constants.USER_ID, msg.requesterId)
    payload.put(Constants.AUTH_TOKEN, msg.token)
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.VALIDATE_AUTH_TOKEN_REPLY, None)
    Util.buildJson(header, payload)
  }

  def validateAuthTokenTimeoutToJson(msg: ValidateAuthTokenTimedOut): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.REPLY_TO, msg.correlationId)
    payload.put(Constants.VALID, msg.valid.toString)
    payload.put(Constants.AUTH_TOKEN, msg.token)
    payload.put(Constants.USER_ID, msg.requesterId)
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.VALIDATE_AUTH_TOKEN_TIMEOUT, None)
    Util.buildJson(header, payload)
  }

  def userJoinedToJson(msg: UserJoined): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_JOINED, None)
    Util.buildJson(header, payload)
  }

  def userLeftToJson(msg: UserLeft): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_LEFT, None)
    Util.buildJson(header, payload)
  }

  def presenterAssignedToJson(msg: PresenterAssigned): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.NEW_PRESENTER_ID, msg.presenter.presenterID);
    payload.put(Constants.NEW_PRESENTER_NAME, msg.presenter.presenterName);
    payload.put(Constants.ASSIGNED_BY, msg.presenter.assignedBy);
    payload.put(Constants.RECORDED, msg.recorded)

    val header = Util.buildHeader(MessageNames.PRESENTER_ASSIGNED, None)
    Util.buildJson(header, payload)
  }

  def endAndKickAllToJson(msg: EndAndKickAll): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)

    val header = Util.buildHeader(MessageNames.END_AND_KICK_ALL, None)
    Util.buildJson(header, payload)
  }

  def userListeningOnlyToJson(msg: UserListeningOnly): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.LISTEN_ONLY, msg.listenOnly)

    val header = Util.buildHeader(MessageNames.USER_LISTEN_ONLY, None)
    Util.buildJson(header, payload)
  }
}
