package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SyncGetGroupChatMsgsMsgHdlr {
  this: GroupChatHdlrs =>

  def handleSyncGetGroupChatMsgs(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildSyncGetGroupChatMsgsRespMsg(msgs: Vector[GroupChatMsgToUser], chatId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(SyncGetGroupChatMsgsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetGroupChatMsgsRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val body = SyncGetGroupChatMsgsRespMsgBody(chatId, msgs)
      val event = SyncGetGroupChatMsgsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }
    GroupChatApp.getAllGroupChatsInMeeting(state) foreach { gc =>
      val msgs = gc.msgs.toVector map (m => GroupChatMsgToUser(m.id, m.createdOn, m.correlationId,
        m.sender, m.color, m.message))
      val respMsg = buildSyncGetGroupChatMsgsRespMsg(msgs, gc.id)
      bus.outGW.send(respMsg)
    }

    state
  }
}
