package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object DeskshareStartedVoiceConfEvtMsg { val NAME = "DeskshareStartedVoiceConfEvtMsg" }
case class DeskshareStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                           body: DeskshareStartedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareStartedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                               callerIdNum: String, callerIdName: String)
