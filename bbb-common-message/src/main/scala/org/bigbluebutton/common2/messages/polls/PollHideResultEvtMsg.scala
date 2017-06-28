package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object PollHideResultEvtMsg { val NAME = "PollHideResultEvtMsg" }
case class PollHideResultEvtMsg(header: BbbClientMsgHeader, body: PollHideResultEvtMsgBody) extends BbbCoreMsg
case class PollHideResultEvtMsgBody(userId: String, pollId: String)
