package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object BreakoutRoomCreatedMsg { val NAME = "BreakoutRoomCreatedMsg" }
case class BreakoutRoomCreatedMsg(header: BbbClientMsgHeader, body: BreakoutRoomCreatedMsgBody) extends BbbCoreMsg
case class BreakoutRoomCreatedMsgBody(meetingId: String, breakoutRoomId: String)

