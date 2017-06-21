package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


// Send by internal actor to tell the breakout actor to send it's list of users to the main meeting actor.
object SendBreakoutUsersUpdateMsg { val NAME = "SendBreakoutUsersUpdateMsg" }
case class SendBreakoutUsersUpdateMsg(header: BbbClientMsgHeader, body: SendBreakoutUsersUpdateMsgBody) extends BbbCoreMsg
case class SendBreakoutUsersUpdateMsgBody(meetingId: String)
