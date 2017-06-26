package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object DeskshareStartRtmpBroadcastVoiceConfMsg { val NAME = "DeskshareStartRtmpBroadcastVoiceConfMsg" }
case class DeskshareStartRtmpBroadcastVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                                   body: DeskshareStartRtmpBroadcastVoiceConfMsgBody) extends BbbCoreMsg
case class DeskshareStartRtmpBroadcastVoiceConfMsgBody(voiceConf: String, deskshareConf: String, url: String, timestamp: String)


