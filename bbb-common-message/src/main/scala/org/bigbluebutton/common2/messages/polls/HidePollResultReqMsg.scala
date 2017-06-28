package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object HidePollResultReqMsg { val NAME = "HidePollResultReqMsg"}
case class HidePollResultReqMsg(header: BbbClientMsgHeader, body: HidePollResultReqMsgBody) extends BbbCoreMsg
case class HidePollResultReqMsgBody(requesterId: String, pollId: String)
