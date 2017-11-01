package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ChatModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, LogHelper }
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.apps.PermissionCheck

trait ClearPublicChatHistoryPubMsgHdlr extends LogHelper with SystemConfiguration {
  def handle(msg: ClearPublicChatHistoryPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: ClearPublicChatHistoryPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ClearPublicChatHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ClearPublicChatHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ClearPublicChatHistoryEvtMsgBody()
      val event = ClearPublicChatHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (applyPermissionCheck && !PermissionCheck.isAllowed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear chat in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW)
    } else {
      ChatModel.clearPublicChatHistory(liveMeeting.chatModel)
      broadcastEvent(msg)
    }
  }

}
