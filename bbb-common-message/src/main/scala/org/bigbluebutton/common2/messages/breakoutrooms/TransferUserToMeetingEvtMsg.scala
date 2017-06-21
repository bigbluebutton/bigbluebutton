package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object TransferUserToMeetingEvtMsg { val NAME = "TransferUserToMeetingEvtMsg" }
case class TransferUserToMeetingEvtMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingEvtMsgBody) extends BbbCoreMsg
case class TransferUserToMeetingEvtMsgBody(voiceConfId: String, targetVoiceConfId: String, userId: String)
