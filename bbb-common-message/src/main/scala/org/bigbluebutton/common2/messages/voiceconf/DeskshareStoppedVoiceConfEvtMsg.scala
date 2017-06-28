package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object DeskshareStoppedVoiceConfEvtMsg { val NAME = "DeskshareStoppedVoiceConfEvtMsg"}
case class DeskshareStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                           body: DeskshareStoppedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareStoppedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                               callerIdNum: String, callerIdName: String)
