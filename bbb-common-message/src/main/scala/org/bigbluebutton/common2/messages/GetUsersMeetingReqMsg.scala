package org.bigbluebutton.common2.messages


object GetUsersMeetingReqMsg {
  val NAME = "GetUsersMeetingReqMsg"
}

case class GetUsersMeetingReqMsg(header: BbbClientMsgHeader, body: GetUsersMeetingReqMsgBody) extends BbbCoreMsg
case class GetUsersMeetingReqMsgBody(userId: String)
