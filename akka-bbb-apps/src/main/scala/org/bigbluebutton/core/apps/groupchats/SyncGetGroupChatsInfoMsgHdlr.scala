package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SyncGetGroupChatsInfoMsgHdlr {
  this: GroupChatHdlrs =>

  def handleSyncGetGroupChatsInfo(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildSyncGetGroupChatsRespMsg(allChats: Vector[GroupChatInfo]): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(SyncGetGroupChatsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetGroupChatsRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val body = SyncGetGroupChatsRespMsgBody(allChats)
      val event = SyncGetGroupChatsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    def buildSyncGetGroupChatMsgsRespMsg(msgs: Vector[GroupChatMsgToUser], chatId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(SyncGetGroupChatMsgsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetGroupChatMsgsRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val body = SyncGetGroupChatMsgsRespMsgBody(chatId, msgs)
      val event = SyncGetGroupChatMsgsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    // fetching all the group chats in the meeting
    val chats = GroupChatApp.getAllGroupChatsInMeeting(state)

    // mapping group chats, while fetching and publishing messages for each group chat
    val allChats = chats map (pc => {

      val msgs = pc.msgs.toVector map (m => GroupChatMsgToUser(m.id, m.createdOn, m.correlationId,
        m.sender, m.chatEmphasizedText, m.message))
      val respMsg = buildSyncGetGroupChatMsgsRespMsg(msgs, pc.id)
      bus.outGW.send(respMsg)

      GroupChatInfo(pc.id, pc.access, pc.createdBy, pc.users)
    })

    // publishing a message with the group chat info
    val respMsg = buildSyncGetGroupChatsRespMsg(allChats)
    bus.outGW.send(respMsg)

    state
  }
}
