package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object EjectAllFromVoiceConfMsg { val NAME = "EjectAllFromVoiceConfMsg" }
case class EjectAllFromVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                    body: EjectAllFromVoiceConfMsgBody) extends BbbCoreMsg
case class EjectAllFromVoiceConfMsgBody(voiceConf: String)


