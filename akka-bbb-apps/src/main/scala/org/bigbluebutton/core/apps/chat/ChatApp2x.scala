package org.bigbluebutton.core.apps.chat

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

class ChatApp2x(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMsgRouter
)(implicit val context: ActorContext)
    extends GetChatHistoryReqMsgHdlr
    with SendPublicMessagePubMsgHdlr
    with SendPrivateMessagePubMsgHdlr
    with ClearPublicChatHistoryPubMsgHdlr {

  val log = Logging(context.system, getClass)

}
