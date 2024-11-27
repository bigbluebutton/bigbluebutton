package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait DeleteGroupChatMessageReqMsgHdlr extends HandlerHelpers {
  this: GroupChatHdlrs =>

  def handle(msg: DeleteGroupChatMessageReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val chatDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("chat")
    val deleteChatMessageDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("deleteChatMessage")
    var chatLocked: Boolean = false
    var chatLockedForUser: Boolean = false

    var newState = state

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

      if (!chatDisabled && !deleteChatMessageDisabled && !(applyPermissionCheck && chatLocked) && !chatLockedForUser) {
        for {
          gcMessage <- groupChat.msgs.find(gcm => gcm.id == msg.body.messageId)
        } yield {
          val chatIsPrivate = groupChat.access == GroupChatAccess.PRIVATE
          val userIsAParticipant = groupChat.users.exists(u => u.id == user.intId)
          val userIsOwner = gcMessage.sender.id == user.intId

          if ((chatIsPrivate && userIsAParticipant) || !chatIsPrivate) {
            if (userIsOwner ||
              (userIsModerator && !liveMeeting.props.meetingProp.isBreakout) //not allowed in breakoutRooms as everyone is moderator
              ) {
              val updatedGroupChat = GroupChatApp.deleteGroupChatMessage(liveMeeting.props.meetingProp.intId, groupChat, state.groupChats, gcMessage, user.intId)

              val event = buildGroupChatMessageDeletedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.chatId, msg.header.userId, gcMessage.id)
              bus.outGW.send(event)
              newState = state.update(updatedGroupChat)
            } else {
              val reason = "User doesn't have permission to delete chat message"
              PermissionCheck.ejectUserForFailedPermission(msg.header.meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
            }
          } else {
            val reason = "User isn't a participant of the chat"
            PermissionCheck.ejectUserForFailedPermission(msg.header.meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
          }
        }
      }
    }

    newState
  }
}
