package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SyncGetGroupChatsMsgHdlr {
  this: GroupChatHdlrs =>

  def handleSyncGetGroupChats(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildSyncGetGroupChatsRespMsg(allChats: Vector[GroupChatInfo]): BbbCommonEnvCoreMsg = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(SyncGetGroupChatsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetGroupChatsRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val body = SyncGetGroupChatsRespMsgBody(allChats)
      val event = SyncGetGroupChatsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val chats = GroupChatApp.getAllGroupChatsInMeeting(state)
    val allChats = chats map (pc => GroupChatInfo(pc.id, pc.name, pc.access, pc.createdBy, pc.users))
    val respMsg = buildSyncGetGroupChatsRespMsg(allChats)
    bus.outGW.send(respMsg)

    state
  }
}
