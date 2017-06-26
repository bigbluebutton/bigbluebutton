package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object MuteUserInVoiceConfMsg { val NAME = "MuteUserInVoiceConfMsg" }
case class MuteUserInVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                  body: MuteUserInVoiceConfMsgBody) extends BbbCoreMsg
case class MuteUserInVoiceConfMsgBody(voiceConf: String, voiceUserId: String, mute: Boolean)

