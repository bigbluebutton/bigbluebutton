package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

// Sent by breakout actor to tell meeting actor the list of users in the breakout room.
object BreakoutRoomUsersUpdateMsg { val NAME = "BreakoutRoomUsersUpdateMsg" }
case class BreakoutRoomUsersUpdateMsg(header: BbbClientMsgHeader, body: BreakoutRoomUsersUpdateMsgBody) extends BbbCoreMsg
case class BreakoutRoomUsersUpdateMsgBody(meetingId: String, breakoutMeetingId: String, users: Vector[BreakoutUserVO])
