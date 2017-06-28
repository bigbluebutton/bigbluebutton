package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object EjectUserFromVoiceConfMsg { val NAME = "EjectUserFromVoiceConfMsg"}
case class EjectUserFromVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                     body: EjectUserFromVoiceConfMsgBody) extends BbbCoreMsg
case class EjectUserFromVoiceConfMsgBody(voiceConf: String, voiceUserId: String)


