package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object UpdateBreakoutUsersEvtMsg { val NAME = "UpdateBreakoutUsersEvtMsg" }
case class UpdateBreakoutUsersEvtMsg(header: BbbClientMsgHeader, body: UpdateBreakoutUsersEvtMsgBody) extends BbbCoreMsg
case class UpdateBreakoutUsersEvtMsgBody(parentMeetingId: String, recorded: Boolean, breakoutMeetingId: String, users: Vector[BreakoutUserVO])

