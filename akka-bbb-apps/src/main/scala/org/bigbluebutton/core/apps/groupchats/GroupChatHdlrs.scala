package org.bigbluebutton.core.apps.groupchats

import akka.actor.ActorContext
import akka.event.Logging

class GroupChatHdlrs(implicit val context: ActorContext)
    extends CreateGroupChatReqMsgHdlr
    with CreateDefaultPublicGroupChat
    with GetGroupChatMsgsReqMsgHdlr
    with GetGroupChatsReqMsgHdlr
    with SendGroupChatMessageMsgHdlr {

  val log = Logging(context.system, getClass)
}
