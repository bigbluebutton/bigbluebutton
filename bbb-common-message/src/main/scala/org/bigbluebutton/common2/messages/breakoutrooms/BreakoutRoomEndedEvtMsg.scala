package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object BreakoutRoomEndedEvtMsg { val NAME = "BreakoutRoomEndedEvtMsg" }
case class BreakoutRoomEndedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomEndedEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomEndedEvtMsgBody(parentMeetingId: String, meetingId: String)
