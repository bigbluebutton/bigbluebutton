package org.bigbluebutton.core.api

import java.lang.Boolean

object Role extends Enumeration {
  type Role = Value
  val MODERATOR = Value("MODERATOR")
  val VIEWER = Value("VIEWER")
}

object GuestPolicy extends Enumeration {
  type GuestPolicy = Value
  val ALWAYS_ACCEPT = Value("ALWAYS_ACCEPT")
  val ALWAYS_DENY = Value("ALWAYS_DENY")
  val ASK_MODERATOR = Value("ASK_MODERATOR")
}

case class StatusCode(val code: Int, val text: String)
object StatusCodes {
  // Borrowed from https://dev.twitter.com/overview/api/response-codes (ralam June 18, 2015)
  val OK = new StatusCode(200, "OK")
  val NOT_MODIFIED = new StatusCode(304, "Not Modified")
  val BAD_REQUEST = new StatusCode(400, "Bad Request")
  val UNAUTHORIZED = new StatusCode(401, "Unauthorized")
  val FORBIDDEN = new StatusCode(403, "Forbidden")
  val NOT_FOUND = new StatusCode(404, "Not Found")
  val NOT_ACCEPTABLE = new StatusCode(406, "Not Acceptable")
  val INTERNAL_SERVER_ERROR = new StatusCode(500, "Internal Server Error")
  val BAD_GATEWAY = new StatusCode(502, "Bad Gateway")
  val SERVICE_UNAVAIL = new StatusCode(503, "Service Unavailable")
  val GATEWAY_TIMEOUT = new StatusCode(504, "Gateway Timeout")
}

case class ErrorCode(val code: Int, message: String)
object ErrorCodes {
  val RESOURCE_NOT_FOUND = new ErrorCode(1, "Resource not found")
  val INVALID_DATA = new ErrorCode(88, "Invalid data")
}

case class RequestResult(status: StatusCode, errors: Option[Array[ErrorCode]])

case class Presenter(
  presenterID: String,
  presenterName: String,
  assignedBy: String)

case class User(
  id: String,
  externId: String,
  name: String,
  moderator: Boolean,
  avatarUrl: String,
  logoutUrl: String,
  presenter: Boolean,
  callerId: CallerId,
  phoneCaller: Boolean,
  emojiStatus: String,
  muted: Boolean,
  talking: Boolean)

case class CallerId(
  name: String,
  number: String)

case class Permissions(
  disableCam: Boolean = false,
  disableMic: Boolean = false,
  disablePrivChat: Boolean = false,
  disablePubChat: Boolean = false,
  lockedLayout: Boolean = false,
  lockOnJoin: Boolean = false,
  lockOnJoinConfigurable: Boolean = false)

case class RegisteredUser(
  id: String,
  externId: String,
  name: String,
  role: Role.Role,
  authToken: String,
  guest: Boolean,
  waitingForAcceptance: Boolean)

case class Voice(
  id: String,
  webId: String,
  callId: CallerId,
  phoningIn: Boolean,
  joined: Boolean,
  locked: Boolean,
  muted: Boolean,
  talking: Boolean)

case class UserVO(
  userID: String,
  externUserID: String,
  name: String,
  role: Role.Role,
  guest: Boolean,
  waitingForAcceptance: Boolean,
  emojiStatus: String,
  presenter: Boolean,
  hasStream: Boolean,
  locked: Boolean,
  webcamStreams: Set[String],
  phoneUser: Boolean,
  voiceUser: VoiceUser,
  listenOnly: Boolean,
  joinedWeb: Boolean)

case class VoiceUser(
  userId: String,
  webUserId: String,
  callerName: String,
  callerNum: String,
  joined: Boolean,
  locked: Boolean,
  muted: Boolean,
  talking: Boolean,
  listenOnly: Boolean)

case class MeetingConfig(name: String,
  id: MeetingID,
  passwords: MeetingPasswords,
  welcomeMsg: String,
  logoutUrl: String,
  maxUsers: Int,
  record: Boolean = false,
  duration: MeetingDuration,
  defaultAvatarURL: String,
  defaultConfigToken: String,
  guestPolicy: GuestPolicy.GuestPolicy = GuestPolicy.ASK_MODERATOR)

case class MeetingName(name: String)

case class MeetingID(internal: String, external: String)

case class VoiceConfig(telVoice: String, webVoice: String, dialNumber: String)

case class MeetingPasswords(moderatorPass: String, viewerPass: String)

case class MeetingDuration(duration: Int = 0, createdTime: Long = 0,
  startTime: Long = 0, endTime: Long = 0)

case class MeetingInfo(meetingID: String, meetingName: String, recorded: Boolean, voiceBridge: String, duration: Long)

case class Note(
  name: String,
  document: String,
  patchCounter: Int)
