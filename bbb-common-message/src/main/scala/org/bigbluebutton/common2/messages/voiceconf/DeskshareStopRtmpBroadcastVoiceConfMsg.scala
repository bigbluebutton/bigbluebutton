package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object DeskshareStopRtmpBroadcastVoiceConfMsg { val NAME = "DeskshareStopRtmpBroadcastVoiceConfMsg" }
case class DeskshareStopRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                                  body: DeskshareStopRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
case class DeskshareStopRtmpBroadcastVoiceConfMsgBody(voiceConf: String, deskshareConf: String, url: String, timestamp: String)


