package org.bigbluebutton.common2.messages

import org.bigbluebutton.common2.domain.DefaultProps

object MessageBody {
  case class CreateMeetingReqMsgBody(props: DefaultProps)
  case class MeetingCreatedEvtBody(props: DefaultProps)
  case class ValidateAuthTokenReqMsgBody(userId: String, authToken: String)
  case class RegisterUserReqMsgBody(meetingId: String, intUserId: String, name: String, role: String,
                                    extUserId: String, authToken: String, avatarURL: String,
                                    guest: Boolean, authed: Boolean)
  case class ValidateAuthTokenRespMsgBody(userId: String, authToken: String, valid: Boolean)
  case class UserJoinReqMsgBody(userId: String, authToken: String)
  case class UserLeaveReqMsgBody(userId: String, sessionId: String)
  case class GetUsersReqMsgBody(requesterId: String)
  case class UserEmojiStatusChangeReqMsgBody(userId: String, emoji: String)
  case class EjectUserFromMeetingReqMsgBody(userId: String, requesterId: String)
  case class UserShareWebcamMsgBody(userId: String, stream: String)
  case class UserUnshareWebcamMsgBody(userId: String, stream: String)
  case class ChangeUserStatusReqMsgBody(userId: String, status: String, value: String)
  case class ChangeUserRoleReqMsgBody(userId: String, role: String)
  case class AssignPresenterReqMsgBody(userId: String, requesterId: String)
  case class SetRecordingReqMsgBody(recording: Boolean, requesterId: String)
  case class GetRecordingStatusReqMsgBody(requesterId: String)
  case class AllowUserToShareDesktopReqMsgBody(userId: String)

}
