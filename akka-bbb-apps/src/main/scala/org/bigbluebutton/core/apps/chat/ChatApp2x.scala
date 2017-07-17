package org.bigbluebutton.core.apps.chat

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.msgs.TranscriptVO
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.LiveMeeting

class ChatApp2x(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMessageGateway
)(implicit val context: ActorContext)
    extends GetChatHistoryReqMsgHdlr
    with SendPublicMessagePubMsgHdlr
    with SendPrivateMessagePubMsgHdlr
    with ClearPublicChatHistoryPubMsgHdlr {

  val log = Logging(context.system, getClass)

}
