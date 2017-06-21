package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object StopPollReqMsg { val NAME = "StopPollReqMsg"}
case class StopPollReqMsg(header: BbbClientMsgHeader, body: StopPollReqMsgBody) extends BbbCoreMsg
case class StopPollReqMsgBody(requesterId: String)
