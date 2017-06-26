package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.BbbCoreMsg


object DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg { val NAME = "DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg"}
case class DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg(header: BbbCoreVoiceConfHeader,
                                                        body: DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgBody) extends BbbCoreMsg
case class DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgBody(voiceConf: String, deskshareConf: String,
                                                            stream: String, vidWidth: String, vidHeight: String,
                                                            timestamp: String)
