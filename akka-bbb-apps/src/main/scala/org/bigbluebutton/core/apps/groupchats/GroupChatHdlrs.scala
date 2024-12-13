package org.bigbluebutton.core.apps.groupchats

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class GroupChatHdlrs(implicit val context: ActorContext)
  extends CreateGroupChatReqMsgHdlr
  with CreateDefaultPublicGroupChat
  with GetGroupChatMsgsReqMsgHdlr
  with GetGroupChatsReqMsgHdlr
  with SendGroupChatMessageMsgHdlr
  with EditGroupChatMessageReqMsgHdlr
  with DeleteGroupChatMessageReqMsgHdlr
  with SendGroupChatMessageReactionReqMsgHdlr
  with DeleteGroupChatMessageReactionReqMsgHdlr
  with SendGroupChatMessageFromApiSysPubMsgHdlr
  with SetGroupChatVisibleReqMsgHdlr
  with SetGroupChatLastSeenReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
