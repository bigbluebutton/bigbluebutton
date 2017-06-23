package org.bigbluebutton.common2.messages.voiceconf

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

/**
  * Message sent to clients that the user is muted.
  */

object UserMutedEvtMsg { val NAME = "UserMutedEvtMsg" }
case class UserMutedEvtMsg(header: BbbClientMsgHeader, body: UserMutedEvtMsgBody) extends BbbCoreMsg
case class UserMutedEvtMsgBody(intId: String, voiceUserId: String, muted: Boolean)