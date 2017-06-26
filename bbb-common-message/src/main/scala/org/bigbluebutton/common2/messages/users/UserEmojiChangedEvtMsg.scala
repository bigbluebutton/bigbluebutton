package org.bigbluebutton.common2.messages.users

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object UserEmojiChangedEvtMsg { val NAME = "UserEmojiChangedEvtMsg" }
case class UserEmojiChangedEvtMsg(header: BbbClientMsgHeader, body: UserEmojiChangedEvtMsgBody) extends BbbCoreMsg
case class UserEmojiChangedEvtMsgBody(userId: String, emoji: String)