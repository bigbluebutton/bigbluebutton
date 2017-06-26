package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object StartPollReqMsg { val NAME = "StartPollReqMsg"}
case class StartPollReqMsg(header: BbbClientMsgHeader, body: StartPollReqMsgBody) extends BbbCoreMsg
case class StartPollReqMsgBody(requesterId: String, pollId: String, pollType: String)
