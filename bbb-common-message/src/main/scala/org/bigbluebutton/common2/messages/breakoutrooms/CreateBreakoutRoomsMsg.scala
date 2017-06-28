package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object CreateBreakoutRoomsMsg { val NAME = "CreateBreakoutRoomsMsg" }
case class CreateBreakoutRoomsMsg(header: BbbClientMsgHeader, body: CreateBreakoutRoomsMsgBody) extends BbbCoreMsg
case class CreateBreakoutRoomsMsgBody(meetingId: String, durationInMinutes: Int, record: Boolean, rooms: Vector[BreakoutRoomMsgBody])
case class BreakoutRoomMsgBody(name: String, sequence: Int, users: Vector[String])
