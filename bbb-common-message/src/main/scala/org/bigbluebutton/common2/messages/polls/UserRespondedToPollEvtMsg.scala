package org.bigbluebutton.common2.messages.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object UserRespondedToPollEvtMsg { val NAME = "UserRespondedToPollEvtMsg"}
case class UserRespondedToPollEvtMsg(header: BbbClientMsgHeader, body: UserRespondedToPollEvtMsgBody) extends BbbCoreMsg
case class UserRespondedToPollEvtMsgBody(presenterId: String, pollId: String, poll: SimplePollResultOutVO)
