package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object DeskshareHangUpVoiceConfMsg { val NAME = "DeskshareHangUpVoiceConfMsg" }
case class DeskshareHangUpVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                       body: DeskshareHangUpVoiceConfMsgBody) extends BbbCoreMsg
case class DeskshareHangUpVoiceConfMsgBody(voiceConf: String, deskshareConf: String, timestamp: String)
