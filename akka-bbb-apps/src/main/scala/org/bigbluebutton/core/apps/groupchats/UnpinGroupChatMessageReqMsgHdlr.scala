package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait UnpinGroupChatMessageReqMsgHdlr extends HandlerHelpers {
  this: GroupChatHdlrs =>

  def handle(msg: UnpinGroupChatMessageReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val chatDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("chat")
    val chatPinningDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("pinChatMessage")
    var newState = state

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      groupChat <- state.groupChats.find(msg.body.chatId)
    } yield {
      val userIsModerator = user.role == Roles.MODERATOR_ROLE

      // Only proceed when chat and chat pinning are enabled
      if (!chatDisabled && !chatPinningDisabled) {
        for {
          gcMessage <- groupChat.msgs.find(gcm => gcm.id == msg.body.messageId)
        } yield {
          val messageIsPinned = groupChat.isPinned(gcMessage.id)

          if (!userIsModerator) {
            val reason = "User doesn't have permission to unpin chat message"
            PermissionCheck.ejectUserForFailedPermission(msg.header.meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
          } else if (!messageIsPinned) {
            // nothing to do: message is not pinned
          } else {
            log.info(s"Unpin requested by user=${msg.header.userId} for message=${gcMessage.id} chat=${msg.body.chatId} in meeting=${liveMeeting.props.meetingProp.intId}")

            val updatedGroupChat = GroupChatApp.unpinGroupChatMessage(liveMeeting.props.meetingProp.intId, groupChat, state.groupChats, gcMessage)

            val event = buildGroupChatMessageUnpinEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.chatId, msg.header.userId, gcMessage.id)
            bus.outGW.send(event)
            log.info(s"Unpin event sent for message=${gcMessage.id} chat=${msg.body.chatId}")
            newState = state.update(updatedGroupChat)
          }
        }
      }
    }

    newState
  }
}
