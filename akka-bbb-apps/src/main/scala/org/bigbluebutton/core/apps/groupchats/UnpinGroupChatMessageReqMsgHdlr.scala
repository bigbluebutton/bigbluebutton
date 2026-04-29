package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait UnpinGroupChatMessageReqMsgHdlr extends HandlerHelpers with PinChatMessageHelpers {
  this: GroupChatHdlrs =>

  def handle(msg: UnpinGroupChatMessageReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    withPinPermission(
      msg.header.meetingId, msg.header.userId, msg.body.chatId, msg.body.messageId,
      state, liveMeeting, bus,
      "User doesn't have permission to unpin chat message"
    ) { (_, groupChat, gcMessage) =>
        if (!groupChat.isPinned(gcMessage.id)) {
          // nothing to do: message is not pinned
          state
        } else {
          log.info(s"Unpin requested by user=${msg.header.userId} for message=${gcMessage.id} chat=${msg.body.chatId} in meeting=${liveMeeting.props.meetingProp.intId}")
          val updatedGroupChat = GroupChatApp.unpinGroupChatMessage(liveMeeting.props.meetingProp.intId, groupChat, state.groupChats, gcMessage)
          val event = buildGroupChatMessageUnpinEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.chatId, msg.header.userId, gcMessage.id)
          bus.outGW.send(event)
          log.info(s"Unpin event sent for message=${gcMessage.id} chat=${msg.body.chatId}")
          state.update(updatedGroupChat)
        }
      }
  }
}
