package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object RespondToPollReqMsg { val NAME = "RespondToPollReqMsg"}
case class RespondToPollReqMsg(header: BbbClientMsgHeader, body: RespondToPollReqMsgBody) extends BbbCoreMsg
case class RespondToPollReqMsgBody(requesterId: String, pollId: String, questionId: Int, answerId: Int)
