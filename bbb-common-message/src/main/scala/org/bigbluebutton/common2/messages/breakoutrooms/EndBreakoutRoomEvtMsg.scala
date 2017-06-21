package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object EndBreakoutRoomEvtMsg { val NAME = "EndBreakoutRoomEvtMsg" }
case class EndBreakoutRoomEvtMsg(header: BbbClientMsgHeader, body: EndBreakoutRoomEvtMsgBody) extends BbbCoreMsg
case class EndBreakoutRoomEvtMsgBody(breakoutMeetingId: String)
