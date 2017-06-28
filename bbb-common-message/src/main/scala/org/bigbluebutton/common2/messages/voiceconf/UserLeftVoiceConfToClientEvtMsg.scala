package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object UserLeftVoiceConfToClientEvtMsg { val NAME = "UserLeftVoiceConfToClientEvtMsg" }
case class UserLeftVoiceConfToClientEvtMsg(header: BbbClientMsgHeader, body: UserLeftVoiceConfToClientEvtMsgBody) extends BbbCoreMsg
case class UserLeftVoiceConfToClientEvtMsgBody(intId: String, voiceUserId: String)
