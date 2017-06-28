package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

// Outgoing messages
object BreakoutRoomsListEvtMsg { val NAME = "BreakoutRoomsListEvtMsg" }
case class BreakoutRoomsListEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomsListEvtMsgBody(meetingId: String, rooms: Vector[BreakoutRoomInfo], roomsReady: Boolean)
case class BreakoutRoomInfo(name: String, externalMeetingId: String, meetingId: String, sequence: Int)
