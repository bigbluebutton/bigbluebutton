package org.bigbluebutton.common2.messages.users

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object UserLeaveReqMsg { val NAME = "UserLeaveReqMsg" }
case class UserLeaveReqMsg(header: BbbClientMsgHeader, body: UserLeaveReqMsgBody) extends BbbCoreMsg
case class UserLeaveReqMsgBody(userId: String, sessionId: String)
