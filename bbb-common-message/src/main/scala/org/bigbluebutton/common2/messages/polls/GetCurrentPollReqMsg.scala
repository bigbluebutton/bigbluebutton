package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object GetCurrentPollReqMsg { val NAME = "GetCurrentPollReqMsg"}
case class GetCurrentPollReqMsg(header: BbbClientMsgHeader, body: GetCurrentPollReqMsgBody) extends BbbCoreMsg
case class GetCurrentPollReqMsgBody(requesterId: String)
