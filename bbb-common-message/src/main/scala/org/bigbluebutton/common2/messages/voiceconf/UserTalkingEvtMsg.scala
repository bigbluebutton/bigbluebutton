package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

/**
  * Message sent to clients that the user is talking.
  */

object UserTalkingEvtMsg { val NAME = "UserTalkingEvtMsg" }
case class UserTalkingEvtMsg(header: BbbClientMsgHeader, body: UserTalkingEvtMsgBody) extends BbbCoreMsg
case class UserTalkingEvtMsgBody(intId: String, voiceUserId: String, talking: Boolean)