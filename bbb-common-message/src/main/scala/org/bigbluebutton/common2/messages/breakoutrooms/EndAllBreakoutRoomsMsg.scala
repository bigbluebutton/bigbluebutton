package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

// Sent by user to request ending all the breakout rooms
object EndAllBreakoutRoomsMsg { val NAME = "EndAllBreakoutRoomsMsg" }
case class EndAllBreakoutRoomsMsg(header: BbbClientMsgHeader, body: EndAllBreakoutRoomsMsgBody) extends BbbCoreMsg
case class EndAllBreakoutRoomsMsgBody(meetingId: String)
