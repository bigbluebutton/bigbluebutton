package org.bigbluebutton.core.apps.groupchats

import akka.actor.ActorContext

class GroupChatsApp(implicit val context: ActorContext)
    extends CreateGroupChatReqMsgHdlr
    with GetGroupChatMsgsReqMsgHdlr
    with GetGroupChatsReqMsgHdlr {

}
