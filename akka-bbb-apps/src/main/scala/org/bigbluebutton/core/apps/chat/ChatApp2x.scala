package org.bigbluebutton.core.apps.chat

import org.apache.pekko.actor.ActorContext

class ChatApp2x(implicit val context: ActorContext)
  extends GetChatHistoryReqMsgHdlr
  with SendPublicMessagePubMsgHdlr
  with SendPrivateMessagePubMsgHdlr
  with ClearPublicChatHistoryPubMsgHdlr
  with UserTypingPubMsgHdlr {

}
