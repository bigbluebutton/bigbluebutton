package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object UserTalkingInVoiceConfEvtMsg { val NAME = "UserTalkingInVoiceConfEvtMsg" }
case class UserTalkingInVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                        body: UserTalkingInVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserTalkingInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, talking: Boolean)
