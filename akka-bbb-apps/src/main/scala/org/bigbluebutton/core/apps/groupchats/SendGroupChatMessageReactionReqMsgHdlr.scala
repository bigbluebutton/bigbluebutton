package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.ChatMessageReactionDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait SendGroupChatMessageReactionReqMsgHdlr extends HandlerHelpers {
  this: GroupChatHdlrs =>

  def handle(msg: SendGroupChatMessageReactionReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val chatDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("chat")
    val chatMessageReactionsDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("chatMessageReactions")
    var chatLocked: Boolean = false
    var chatLockedForUser: Boolean = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      groupChat <- state.groupChats.find(msg.body.chatId)
    } yield {
      if (groupChat.access == GroupChatAccess.PUBLIC && user.userLockSettings.disablePublicChat && user.role != Roles.MODERATOR_ROLE) {
        chatLockedForUser = true
      }

      val userIsModerator = user.role == Roles.MODERATOR_ROLE

      if (!userIsModerator && user.locked) {
        val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
        if (groupChat.access == GroupChatAccess.PRIVATE) {
          val modMembers = groupChat.users.filter(cu => Users2x.findWithIntId(liveMeeting.users2x, cu.id) match {
            case Some(user) => user.role == Roles.MODERATOR_ROLE
            case None       => false
          })
          // don't lock private chats that involve a moderator
          if (modMembers.isEmpty) {
            chatLocked = permissions.disablePrivChat
          }
        } else {
          chatLocked = permissions.disablePubChat
        }
      }

      if (!chatDisabled && !chatMessageReactionsDisabled && !(applyPermissionCheck && chatLocked) && !chatLockedForUser) {
        for {
          gcMessage <- groupChat.msgs.find(gcm => gcm.id == msg.body.messageId)
        } yield {
          val chatIsPrivate = groupChat.access == GroupChatAccess.PRIVATE
          val userIsAParticipant = groupChat.users.exists(u => u.id == user.intId)

          if ((chatIsPrivate && userIsAParticipant) || !chatIsPrivate) {
            val event = buildGroupChatMessageReactionSentEvtMsg(liveMeeting.props.meetingProp.intId, msg.header.userId, msg.body.chatId, gcMessage.id, msg.body.reactionEmoji)
            bus.outGW.send(event)
            ChatMessageReactionDAO.insert(liveMeeting.props.meetingProp.intId, gcMessage.id, msg.header.userId, msg.body.reactionEmoji)
          } else {
            val reason = "User isn't a participant of the chat"
            PermissionCheck.ejectUserForFailedPermission(msg.header.meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
          }
        }
      }
    }
  }
}
