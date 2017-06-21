package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.domain.SimplePollOutVO
import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object PollStartedEvtMsg { val NAME = "PollStartedEvtMsg" }
case class PollStartedEvtMsg(header: BbbClientMsgHeader, body: PollStartedEvtMsgBody) extends BbbCoreMsg
case class PollStartedEvtMsgBody(userId: String, pollId: String, poll: SimplePollOutVO)
