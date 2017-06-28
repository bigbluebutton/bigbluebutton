package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object BreakoutRoomStartedEvtMsg { val NAME = "BreakoutRoomStartedEvtMsg" }
case class BreakoutRoomStartedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomStartedEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomStartedEvtMsgBody(parentMeetingId: String, recorded: Boolean, breakout: BreakoutRoomInfo)
