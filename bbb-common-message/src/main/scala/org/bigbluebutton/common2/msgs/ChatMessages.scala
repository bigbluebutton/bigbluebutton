package org.bigbluebutton.common2.msgs

/* In Messages  */

object ClearPublicChatHistoryPubMsg { val NAME = "ClearPublicChatHistoryPubMsg" }
case class ClearPublicChatHistoryPubMsg(header: BbbClientMsgHeader, body: ClearPublicChatHistoryPubMsgBody) extends StandardMsg
case class ClearPublicChatHistoryPubMsgBody(chatId: String)

/* Out Messages */

object SendPublicMessageEvtMsg { val NAME = "SendPublicMessageEvtMsg" }
case class SendPublicMessageEvtMsg(header: BbbClientMsgHeader, body: SendPublicMessageEvtMsgBody) extends StandardMsg
case class SendPublicMessageEvtMsgBody(message: ChatMessageVO)

object ClearPublicChatHistoryEvtMsg { val NAME = "ClearPublicChatHistoryEvtMsg" }
case class ClearPublicChatHistoryEvtMsg(header: BbbClientMsgHeader, body: ClearPublicChatHistoryEvtMsgBody) extends StandardMsg
case class ClearPublicChatHistoryEvtMsgBody(chatId: String)

object UserTypingEvtMsg { val NAME = "UserTypingEvtMsg" }
case class UserTypingEvtMsg(header: BbbClientMsgHeader, body: UserTypingEvtMsgBody) extends StandardMsg
case class UserTypingEvtMsgBody(chatId: String, userId: String)

case class ChatMessageVO(fromUserId: String, fromUsername: String, fromColor: String, fromTime: Long, fromTimezoneOffset: Int,
                         toUserId: String, toUsername: String, message: String)