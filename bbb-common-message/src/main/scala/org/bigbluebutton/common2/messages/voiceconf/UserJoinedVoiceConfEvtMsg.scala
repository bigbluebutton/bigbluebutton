package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object UserJoinedVoiceConfEvtMsg { val NAME = "UserJoinedVoiceConfEvtMsg" }
case class UserJoinedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                     body: UserJoinedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class UserJoinedVoiceConfEvtMsgBody(voiceConf: String, voiceUserId: String, intId: String,
                                         callerIdName: String, callerIdNum: String, muted: Boolean,
                                         talking: Boolean, callingWith: String)

