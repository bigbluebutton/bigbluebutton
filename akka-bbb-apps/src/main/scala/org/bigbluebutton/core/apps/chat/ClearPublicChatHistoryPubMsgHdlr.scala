package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ ChatModel, PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, LogHelper }
import org.bigbluebutton.core.domain.MeetingState2x

trait ClearPublicChatHistoryPubMsgHdlr extends LogHelper with RightsManagementTrait {

  def handle(msg: ClearPublicChatHistoryPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    def broadcastEvent(msg: ClearPublicChatHistoryPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ClearPublicChatHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ClearPublicChatHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ClearPublicChatHistoryEvtMsgBody(msg.body.chatId)
      val event = ClearPublicChatHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear chat in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      ChatModel.clearPublicChatHistory(liveMeeting.chatModel)
      val newState = for {
        gc <- state.groupChats.find(msg.body.chatId)
      } yield {
        broadcastEvent(msg)
        val newGc = gc.clearMessages()
        val gcs = state.groupChats.update(newGc)
        state.update(gcs)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    }
  }

}
