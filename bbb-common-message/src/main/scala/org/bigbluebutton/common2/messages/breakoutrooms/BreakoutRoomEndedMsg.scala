package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

// Sent by breakout actor to tell meeting actor that breakout room has been ended
object BreakoutRoomEndedMsg { val NAME = "BreakoutRoomEndedMsg" }
case class BreakoutRoomEndedMsg(header: BbbClientMsgHeader, body: BreakoutRoomEndedMsgBody) extends BbbCoreMsg
case class BreakoutRoomEndedMsgBody(meetingId: String, breakoutRoomId: String)
