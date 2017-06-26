package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object ShowPollResultReqMsg { val NAME = "ShowPollResultReqMsg"}
case class ShowPollResultReqMsg(header: BbbClientMsgHeader, body: ShowPollResultReqMsgBody) extends BbbCoreMsg
case class ShowPollResultReqMsgBody(requesterId: String, pollId: String)
