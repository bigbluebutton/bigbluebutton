package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.GroupChat
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.SystemUser

trait CreateDefaultPublicGroupChat {
  this: GroupChatHdlrs =>

  def handleCreateDefaultPublicGroupChat(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val groupChat: GroupChat = GroupChatApp.createDefaultPublicGroupChat()

    def buildGroupChatCreatedEvtMsg(meetingId: String, userId: String, gc: GroupChat): BbbCommonEnvCoreMsg = {
      val correlationId = "SYSTEM-" + System.currentTimeMillis()
      val msgs = gc.msgs.map(m => GroupChatApp.toMessageToUser(m))
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(GroupChatCreatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(GroupChatCreatedEvtMsg.NAME, meetingId, userId)
      val body = GroupChatCreatedEvtMsgBody(correlationId, gc.id, gc.createdBy, gc.name, gc.access, gc.users, msgs)
      val event = GroupChatCreatedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    val respMsg = buildGroupChatCreatedEvtMsg(
      liveMeeting.props.meetingProp.intId,
      SystemUser.ID,
      groupChat
    )

    bus.outGW.send(respMsg)
    val groupChats = state.groupChats.add(groupChat)
    state.update(groupChats)
  }
}
