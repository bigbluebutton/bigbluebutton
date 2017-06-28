package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object RequestBreakoutJoinURLMsg { val NAME = "RequestBreakoutJoinURLMsg" }
case class RequestBreakoutJoinURLMsg(header: BbbClientMsgHeader, body: RequestBreakoutJoinURLMsgBody) extends BbbCoreMsg
case class RequestBreakoutJoinURLMsgBody(meetingId: String, breakoutMeetingId: String, userId: String)
