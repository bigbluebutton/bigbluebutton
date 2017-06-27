package org.bigbluebutton.common2.messages


object Users {
  object RegisterUserReqMsg { val NAME = "RegisterUserReqMsg" }
  case class RegisterUserReqMsg(header: BbbCoreHeaderWithMeetingId,
                                body: RegisterUserReqMsgBody) extends BbbCoreMsg

  case class RegisterUserReqMsgBody(meetingId: String, intUserId: String, name: String, role: String,
                                    extUserId: String, authToken: String, avatarURL: String,
                                    guest: Boolean, authed: Boolean)

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

  object ValidateAuthTokenRespMsg { val NAME = "ValidateAuthTokenRespMsg" }
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

    def apply(meetingId: String, userId: String, body: UserJoinedMeetingEvtMsgBody):UserJoinedMeetingEvtMsg = {
      val header = BbbClientMsgHeader(UserJoinedMeetingEvtMsg.NAME, meetingId, userId)
      UserJoinedMeetingEvtMsg(header, body)
    }
  }

  case class UserJoinedMeetingEvtMsg(header: BbbClientMsgHeader,
                                     body: UserJoinedMeetingEvtMsgBody) extends BbbCoreMsg
  case class UserJoinedMeetingEvtMsgBody(intId: String, extId: String, name: String, role: String,
                                         guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String,
                                         presenter: Boolean, locked: Boolean, avatar: String)

  object GetUsersReqMsg { val NAME = "GetUsersReqMsg" }
  case class GetUsersReqMsg(header: BbbClientMsgHeader, body: GetUsersReqMsgBody) extends BbbCoreMsg
  case class GetUsersReqMsgBody(requesterId: String)



  object UserEmojiChangedEvtMsg { val NAME = "UserEmojiChangedEvtMsg" }
  case class UserEmojiChangedEvtMsg(header: BbbClientMsgHeader, body: UserEmojiChangedEvtMsgBody) extends BbbCoreMsg
  case class UserEmojiChangedEvtMsgBody(userId: String, emoji: String)

  object UserJoinMeetingReqMsg { val NAME = "UserJoinMeetingReqMsg" }
  case class UserJoinMeetingReqMsg(header: BbbClientMsgHeader, body: UserJoinMeetingReqMsgBody) extends BbbCoreMsg
  case class UserJoinMeetingReqMsgBody(userId: String, authToken: String)

  object UserLeaveReqMsg { val NAME = "UserLeaveReqMsg" }
  case class UserLeaveReqMsg(header: BbbClientMsgHeader, body: UserLeaveReqMsgBody) extends BbbCoreMsg
  case class UserLeaveReqMsgBody(userId: String, sessionId: String)
}
