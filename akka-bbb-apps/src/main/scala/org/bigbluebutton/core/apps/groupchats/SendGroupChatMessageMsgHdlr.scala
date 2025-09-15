package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsBooleanOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.models.Roles

trait SendGroupChatMessageMsgHdlr extends HandlerHelpers {
  this: GroupChatHdlrs =>

  def handle(msg: SendGroupChatMessageMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def determineMessageType(metadata: Map[String, Any]): String = {
      if (metadata.contains("pluginName")) {
        GroupChatMessageType.PLUGIN
      } else {
        GroupChatMessageType.DEFAULT
      }
    }

    val chatDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("chat")
    var privateChatDisabled: Boolean = false
    val replyChatMessageDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("replyChatMessage")
    var chatLocked: Boolean = false
    var chatLockedForUser: Boolean = false
    var hasModMembers: Boolean = false
    var isPrivateChat: Boolean = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      groupChat <- state.groupChats.find(msg.body.chatId)
    } yield {
      if (groupChat.access == GroupChatAccess.PRIVATE) {
        privateChatDisabled = liveMeeting.props.meetingProp.disabledFeatures.contains("privateChat")
        isPrivateChat = true
      }

      if (groupChat.access == GroupChatAccess.PUBLIC && user.userLockSettings.disablePublicChat && user.role != Roles.MODERATOR_ROLE) {
        chatLockedForUser = true
      }

      if (user.role != Roles.MODERATOR_ROLE && user.locked) {
        val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
        if (groupChat.access == GroupChatAccess.PRIVATE) {
          val modMembers = groupChat.users.filter(cu => Users2x.findWithIntId(liveMeeting.users2x, cu.id) match {
            case Some(user) => user.role == Roles.MODERATOR_ROLE
            case None       => false
          })
          // don't lock private chats that involve a moderator
          if (modMembers.isEmpty) {
            chatLocked = permissions.disablePrivChat
          } else {
            hasModMembers = true
          }
        } else {
          chatLocked = permissions.disablePubChat
        }
      } else {
        hasModMembers = true
      }
    }

    if (!(!isPrivateChat && chatDisabled) &&
      !(isPrivateChat && privateChatDisabled && !hasModMembers) &&
      !(applyPermissionCheck && chatLocked) &&
      !chatLockedForUser) {
      val newState = for {
        sender <- GroupChatApp.findGroupChatUser(msg.header.userId, liveMeeting.users2x)
        chat <- state.groupChats.find(msg.body.chatId)
      } yield {
        val chatIsPrivate = chat.access == GroupChatAccess.PRIVATE;
        val userIsAParticipant = chat.users.exists(u => u.id == sender.id);

        if ((chatIsPrivate && userIsAParticipant) || !chatIsPrivate) {
          val moderatorChatEmphasizedEnabled = getConfigPropertyValueByPathAsBooleanOrElse(
            liveMeeting.clientSettings,
            "public.chat.moderatorChatEmphasized",
            alternativeValue = true
          )

          val emphasizedText = moderatorChatEmphasizedEnabled &&
            !chatIsPrivate &&
            sender.role == Roles.MODERATOR_ROLE

          val messageType = determineMessageType(msg.body.msg.metadata)
          val groupChatMsgReceived = {
            if (replyChatMessageDisabled && msg.body.msg.replyToMessageId != "") {
              msg.body.msg.copy(replyToMessageId = "")
            } else {
              msg.body.msg
            }
          }

          val gcMessage = GroupChatApp.toGroupChatMessage(sender, groupChatMsgReceived, emphasizedText)
          val updatedGroupChat = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcMessage, messageType)

          val event = buildGroupChatMessageBroadcastEvtMsg(
            liveMeeting.props.meetingProp.intId,
            msg.header.userId, msg.body.chatId, gcMessage
          )

          bus.outGW.send(event)

          state.update(updatedGroupChat)
        } else {
          val reason = "User isn't a participant of the chat"
          PermissionCheck.ejectUserForFailedPermission(msg.header.meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
          state
        }
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    } else { state }
  }

}
