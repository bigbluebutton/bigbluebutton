package org.bigbluebutton.common2.messages.users

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object RegisterUserReqMsg { val NAME = "RegisterUserReqMsg" }
case class RegisterUserReqMsg(header: BbbCoreHeaderWithMeetingId,
                              body: RegisterUserReqMsgBody) extends BbbCoreMsg

case class RegisterUserReqMsgBody(meetingId: String, intUserId: String, name: String, role: String,
                                  extUserId: String, authToken: String, avatarURL: String,
                                  guest: Boolean, authed: Boolean)
