package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbCoreHeaderWithMeetingId, BbbCoreMsg}

object TransferUserToVoiceConfMsg { val NAME = "TransferUserToVoiceConfMsg" }
case class TransferUserToVoiceConfMsg(header: BbbCoreHeaderWithMeetingId,
                                      body: TransferUserToVoiceConfMsgBody) extends BbbCoreMsg
case class TransferUserToVoiceConfMsgBody(fromVoiceConf: String, toVoiceConf: String, voiceUserId: String)
