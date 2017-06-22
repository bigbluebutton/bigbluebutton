package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object UserJoinedVoiceConfToClientEvtMsg { val NAME = "UserJoinedVoiceConfToClientEvtMsg" }
case class UserJoinedVoiceConfToClientEvtMsg(header: BbbClientMsgHeader, body: UserJoinedVoiceConfToClientEvtMsgBody) extends BbbCoreMsg
case class UserJoinedVoiceConfToClientEvtMsgBody(intId: String, voiceUserId: String, callerName: String,
                                                 callerNum: String, muted: Boolean,
                                                 talking: Boolean, callingWith: String, listenOnly: Boolean)
