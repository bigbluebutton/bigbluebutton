package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object BreakoutRoomsTimeRemainingUpdateEvtMsg { val NAME = "BreakoutRoomsTimeRemainingUpdateEvtMsg" }
case class BreakoutRoomsTimeRemainingUpdateEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomsTimeRemainingUpdateEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomsTimeRemainingUpdateEvtMsgBody(meetingId: String, recorded: Boolean, timeRemaining: Int)

