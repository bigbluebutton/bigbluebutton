package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object PollStoppedEvtMsg { val NAME = "PollStoppedEvtMsg" }
case class PollStoppedEvtMsg(header: BbbClientMsgHeader, body: PollStoppedEvtMsgBody) extends BbbCoreMsg
case class PollStoppedEvtMsgBody(userId: String, pollId: String)
