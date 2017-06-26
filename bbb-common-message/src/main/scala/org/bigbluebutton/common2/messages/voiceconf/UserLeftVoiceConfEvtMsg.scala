package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object UserLeftVoiceConfEvtMsg { val NAME = "UserLeftVoiceConfEvtMsg" }
case class UserLeftVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                   body: UserLeftVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserLeftVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String)
