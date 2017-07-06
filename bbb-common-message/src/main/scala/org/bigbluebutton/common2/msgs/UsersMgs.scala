package org.bigbluebutton.common2.msgs

object RegisterUserReqMsg { val NAME = "RegisterUserReqMsg" }
case class RegisterUserReqMsg(header: BbbCoreHeaderWithMeetingId,
                              body: RegisterUserReqMsgBody) extends BbbCoreMsg
case class RegisterUserReqMsgBody(meetingId: String, intUserId: String, name: String, role: String,
                                  extUserId: String, authToken: String, avatarURL: String,
                                  guest: Boolean, authed: Boolean)

object UserRegisteredRespMsg { val NAME = "UserRegisteredRespMsg" }
case class UserRegisteredRespMsg(header: BbbCoreHeaderWithMeetingId,
                              body: UserRegisteredRespMsgBody) extends BbbCoreMsg
case class UserRegisteredRespMsgBody(meetingId: String, userId: String, name: String, role: String)

object ValidateAuthTokenReqMsg {
  val NAME = "ValidateAuthTokenReqMsg"

  def apply(meetingId: String, userId: String, authToken: String): ValidateAuthTokenReqMsg = {
    val header = BbbClientMsgHeader(ValidateAuthTokenReqMsg.NAME, meetingId, userId)

    val body = ValidateAuthTokenReqMsgBody(userId, authToken)
    ValidateAuthTokenReqMsg(header, body)
  }
}

case class ValidateAuthTokenReqMsg(header: BbbClientMsgHeader,
                                   body: ValidateAuthTokenReqMsgBody) extends BbbCoreMsg

case class ValidateAuthTokenReqMsgBody(userId: String, authToken: String)

object ValidateAuthTokenRespMsg {
  val NAME = "ValidateAuthTokenRespMsg"
}

case class ValidateAuthTokenRespMsg(header: BbbClientMsgHeader,
                                    body: ValidateAuthTokenRespMsgBody) extends BbbCoreMsg

case class ValidateAuthTokenRespMsgBody(userId: String, authToken: String, valid: Boolean, waitForApproval: Boolean)

object UserLeftMeetingEvtMsg {
  val NAME = "UserLeftMeetingEvtMsg"

  def apply(meetingId: String, userId: String, body: UserLeftMeetingEvtMsgBody): UserLeftMeetingEvtMsg = {
    val header = BbbClientMsgHeader(UserLeftMeetingEvtMsg.NAME, meetingId, userId)
    UserLeftMeetingEvtMsg(header, body)
  }
}

case class UserLeftMeetingEvtMsg(header: BbbClientMsgHeader,
                                 body: UserLeftMeetingEvtMsgBody) extends BbbCoreMsg

case class UserLeftMeetingEvtMsgBody(intId: String)

object UserJoinedMeetingEvtMsg {
  val NAME = "UserJoinedMeetingEvtMsg"

  def apply(meetingId: String, userId: String, body: UserJoinedMeetingEvtMsgBody): UserJoinedMeetingEvtMsg = {
    val header = BbbClientMsgHeader(UserJoinedMeetingEvtMsg.NAME, meetingId, userId)
    UserJoinedMeetingEvtMsg(header, body)
  }
}

case class UserJoinedMeetingEvtMsg(header: BbbClientMsgHeader,
                                   body: UserJoinedMeetingEvtMsgBody) extends BbbCoreMsg

case class UserJoinedMeetingEvtMsgBody(intId: String, extId: String, name: String, role: String,
                                       guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String,
                                       presenter: Boolean, locked: Boolean, avatar: String)

object GetUsersReqMsg {
  val NAME = "GetUsersReqMsg"
}

case class GetUsersReqMsg(header: BbbClientMsgHeader, body: GetUsersReqMsgBody) extends BbbCoreMsg

case class GetUsersReqMsgBody(requesterId: String)


object UserEmojiChangedEvtMsg {
  val NAME = "UserEmojiChangedEvtMsg"
}

case class UserEmojiChangedEvtMsg(header: BbbClientMsgHeader, body: UserEmojiChangedEvtMsgBody) extends BbbCoreMsg

case class UserEmojiChangedEvtMsgBody(userId: String, emoji: String)



/**
  * Sent from client to eject the user from the meeting.
  */
object EjectUserFromMeetingCmdMsg { val NAME = "EjectUserFromMeetingCmdMsg" }
case class EjectUserFromMeetingCmdMsg(header: BbbClientMsgHeader, body: EjectUserFromMeetingCmdMsgBody) extends BbbCoreMsg
case class EjectUserFromMeetingCmdMsgBody(userId: String, ejectedBy: String)

/**
  * Sent from client to lock user in meeting.
  */
object LockUserInMeetingCmdMsg { val NAME = "LockUserInMeetingCmdMsg" }
case class LockUserInMeetingCmdMsg(header: BbbClientMsgHeader, body: LockUserInMeetingCmdMsgBody) extends BbbCoreMsg
case class LockUserInMeetingCmdMsgBody(userId: String, lock: Boolean, lockedBy: String)

/**
  * Send to client that user has been locked.
  */
object UserLockedInMeetingEvtMsg { val NAME = "UserLockedInMeetingEvtMsg" }
case class UserLockedInMeetingEvtMsg(header: BbbClientMsgHeader, body: UserLockedInMeetingEvtMsgBody) extends BbbCoreMsg
case class UserLockedInMeetingEvtMsgBody(userId: String, locked: Boolean, lockedBy: String)

object UserJoinMeetingReqMsg { val NAME = "UserJoinMeetingReqMsg" }
case class UserJoinMeetingReqMsg(header: BbbClientMsgHeader, body: UserJoinMeetingReqMsgBody) extends BbbCoreMsg
case class UserJoinMeetingReqMsgBody(userId: String, authToken: String)

object UserLeaveReqMsg {
  val NAME = "UserLeaveReqMsg"
}

case class UserLeaveReqMsg(header: BbbClientMsgHeader, body: UserLeaveReqMsgBody) extends BbbCoreMsg

case class UserLeaveReqMsgBody(userId: String, sessionId: String)

object GetUsersMeetingReqMsg {
  val NAME = "GetUsersMeetingReqMsg"
}

case class GetUsersMeetingReqMsg(header: BbbClientMsgHeader, body: GetUsersMeetingReqMsgBody) extends BbbCoreMsg

case class GetUsersMeetingReqMsgBody(userId: String)

object GetUsersMeetingRespMsg {
  val NAME = "GetUsersMeetingRespMsg"

  def apply(meetingId: String, userId: String, users: Vector[WebUser]): GetUsersMeetingRespMsg = {
    val header = BbbClientMsgHeader(GetUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetUsersMeetingRespMsgBody(users)
    GetUsersMeetingRespMsg(header, body)
  }

}

object SyncGetUsersMeetingRespMsg { val NAME = "SyncGetUsersMeetingRespMsg"}
case class SyncGetUsersMeetingRespMsg(header: BbbClientMsgHeader, body: SyncGetUsersMeetingRespMsgBody) extends BbbCoreMsg
case class SyncGetUsersMeetingRespMsgBody(users: Vector[WebUser])

case class GetUsersMeetingRespMsg(header: BbbClientMsgHeader, body: GetUsersMeetingRespMsgBody) extends BbbCoreMsg

case class GetUsersMeetingRespMsgBody(users: Vector[WebUser])

case class WebUser(intId: String, extId: String, name: String, role: String,
                   guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String, locked: Boolean,
                   presenter: Boolean, avatar: String)

object GetVoiceUsersMeetingRespMsg {
  val NAME = "GetVoiceUsersMeetingRespMsg"

  def apply(meetingId: String, userId: String, users: Vector[VoiceConfUser]): GetVoiceUsersMeetingRespMsg = {
    val header = BbbClientMsgHeader(GetVoiceUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetVoiceUsersMeetingRespMsgBody(users)
    GetVoiceUsersMeetingRespMsg(header, body)
  }
}

case class GetVoiceUsersMeetingRespMsg(header: BbbClientMsgHeader, body: GetVoiceUsersMeetingRespMsgBody) extends BbbCoreMsg

case class GetVoiceUsersMeetingRespMsgBody(users: Vector[VoiceConfUser])

case class VoiceConfUser(intId: String, voiceUserId: String, callingWith: String, callerName: String,
                         callerNum: String, muted: Boolean, talking: Boolean, listenOnly: Boolean)

