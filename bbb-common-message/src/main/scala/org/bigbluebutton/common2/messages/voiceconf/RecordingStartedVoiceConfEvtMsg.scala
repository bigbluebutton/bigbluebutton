package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object RecordingStartedVoiceConfEvtMsg { val NAME = "RecordingStartedVoiceConfEvtMsg" }
case class RecordingStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                           body: RecordingStartedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class RecordingStartedVoiceConfEvtMsgBody(voiceConf: String, stream: String, recording: Boolean, timestamp: String)

