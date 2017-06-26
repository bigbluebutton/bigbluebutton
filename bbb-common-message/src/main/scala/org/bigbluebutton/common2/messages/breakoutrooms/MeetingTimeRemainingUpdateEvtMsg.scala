package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object MeetingTimeRemainingUpdateEvtMsg { val NAME = "MeetingTimeRemainingUpdateEvtMsg" }
case class MeetingTimeRemainingUpdateEvtMsg(header: BbbClientMsgHeader, body: MeetingTimeRemainingUpdateEvtMsgBody) extends BbbCoreMsg
case class MeetingTimeRemainingUpdateEvtMsgBody(meetingId: String, recorded: Boolean, timeRemaining: Int)
