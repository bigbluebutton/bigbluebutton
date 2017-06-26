package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.domain.PollVO
import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object GetCurrentPollRespMsg { val NAME = "GetCurrentPollRespMsg"}
case class GetCurrentPollRespMsg(header: BbbClientMsgHeader, body: GetCurrentPollRespMsgBody) extends BbbCoreMsg
case class GetCurrentPollRespMsgBody(userId: String, hasPoll: Boolean, poll: Option[PollVO])
