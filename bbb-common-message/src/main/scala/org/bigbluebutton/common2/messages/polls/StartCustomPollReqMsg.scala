package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object StartCustomPollReqMsg { val NAME = "StartCustomPollReqMsg"}
case class StartCustomPollReqMsg(header: BbbClientMsgHeader, body: StartCustomPollReqMsgBody) extends BbbCoreMsg
case class StartCustomPollReqMsgBody(requesterId: String, pollId: String, pollType: String, answers: Seq[String])
