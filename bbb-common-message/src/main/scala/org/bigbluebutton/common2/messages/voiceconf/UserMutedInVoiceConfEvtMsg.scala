package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object UserMutedInVoiceConfEvtMsg { val NAME = "UserMutedInVoiceConfEvtMsg" }
case class UserMutedInVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                      body: UserMutedInVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserMutedInVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, muted: Boolean)


