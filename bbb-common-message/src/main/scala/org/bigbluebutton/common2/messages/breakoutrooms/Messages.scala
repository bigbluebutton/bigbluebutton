package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.BbbClientMsgHeader
import org.bigbluebutton.common2.messages.BbbCoreMsg



// Common Value objects
case class BreakoutUserVO(id: String, name: String)
case class BreakoutRoomVO(id: String, externalMeetingId: String, name: String, parentRoomId: String, sequence: Integer, voiceConfId: String,
                          assignedUsers: Vector[String], users: Vector[BreakoutUserVO])
