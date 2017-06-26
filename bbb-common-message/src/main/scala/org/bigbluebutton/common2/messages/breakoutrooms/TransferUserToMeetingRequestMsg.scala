package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


// Sent by user actor to ask for voice conference transfer
object TransferUserToMeetingRequestMsg { val NAME = "TransferUserToMeetingRequestMsg" }
case class TransferUserToMeetingRequestMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingRequestMsgBody) extends BbbCoreMsg
case class TransferUserToMeetingRequestMsgBody(meetingId: String, targetMeetingId: String, userId: String)
