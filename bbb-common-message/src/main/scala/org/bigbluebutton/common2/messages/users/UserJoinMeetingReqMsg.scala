package org.bigbluebutton.common2.messages.users

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object UserJoinMeetingReqMsg { val NAME = "UserJoinMeetingReqMsg" }
case class UserJoinMeetingReqMsg(header: BbbClientMsgHeader, body: UserJoinMeetingReqMsgBody) extends BbbCoreMsg
case class UserJoinMeetingReqMsgBody(userId: String, authToken: String)
