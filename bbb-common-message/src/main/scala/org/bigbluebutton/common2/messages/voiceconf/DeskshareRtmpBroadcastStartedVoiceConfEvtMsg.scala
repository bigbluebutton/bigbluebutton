package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg

object DeskshareRtmpBroadcastStartedVoiceConfEvtMsg { val NAME = "DeskshareRtmpBroadcastStartedVoiceConfEvtMsg"}
case class DeskshareRtmpBroadcastStartedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                        body: DeskshareRtmpBroadcastStartedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareRtmpBroadcastStartedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                            stream: String, vidWidth: String, vidHeight: String,
                                                            timestamp: String)
