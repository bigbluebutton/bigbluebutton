package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object BreakoutRoomJoinURLEvtMsg { val NAME = "BreakoutRoomJoinURLEvtMsg" }
case class BreakoutRoomJoinURLEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomJoinURLEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomJoinURLEvtMsgBody(parentMeetingId: String, recorded: Boolean, breakoutMeetingId: String, userId: String, redirectJoinURL: String, noRedirectJoinURL: String)

