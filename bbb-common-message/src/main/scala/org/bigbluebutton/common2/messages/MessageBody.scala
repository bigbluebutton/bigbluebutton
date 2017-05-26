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
}
