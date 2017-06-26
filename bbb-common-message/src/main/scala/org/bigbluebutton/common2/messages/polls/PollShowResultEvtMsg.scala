package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object PollShowResultEvtMsg { val NAME = "PollShowResultEvtMsg" }
case class PollShowResultEvtMsg(header: BbbClientMsgHeader, body: PollShowResultEvtMsgBody) extends BbbCoreMsg
case class PollShowResultEvtMsgBody(userId: String, pollId: String, poll: SimplePollResultOutVO)
