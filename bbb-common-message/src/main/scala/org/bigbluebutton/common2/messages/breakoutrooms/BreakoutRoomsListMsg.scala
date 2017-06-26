package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object BreakoutRoomsListMsg { val NAME = "BreakoutRoomsListMsg" }
case class BreakoutRoomsListMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListMsgBody) extends BbbCoreMsg
case class BreakoutRoomsListMsgBody(meetingId: String)
