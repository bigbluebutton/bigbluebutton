package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsBooleanOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.checkPermission
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PluginModel.{ ServerCommands, getPluginManifestContentByName }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core.models.{ GroupChatMessage, PluginModel, Roles, UserState, Users2x }
import org.bigbluebutton.core2.MeetingStatus2x

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
        userState <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
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
          val isPluginMessage = messageType == GroupChatMessageType.PLUGIN

          val groupChatMsgReceived = {
            if (replyChatMessageDisabled && msg.body.msg.replyToMessageId != "") {
              msg.body.msg.copy(replyToMessageId = "")
            } else {
              msg.body.msg
            }
          }

          val allowedHtmlElements = getConfigPropertyValueByPathAsBooleanOrElse(liveMeeting.clientSettings, "public.chat.markdownImageAllowed", false)
          val gcMessage = GroupChatApp.toGroupChatMessage(sender, groupChatMsgReceived, emphasizedText, messageType, allowedHtmlElements)

          val allowSendPluginMessage =
            if (isPluginMessage) getAllowSendPluginMessage(liveMeeting.plugins, gcMessage, userState) else true

          if (allowSendPluginMessage) {
            val updatedGroupChat = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcMessage, messageType)

            val event = buildGroupChatMessageBroadcastEvtMsg(
              liveMeeting.props.meetingProp.intId,
              msg.header.userId, msg.body.chatId,
              chat.users.map(u => u.id), gcMessage
            )

            bus.outGW.send(event)

            state.update(updatedGroupChat)
          } else {
            val reason = f"Plugin message is not allowed for user with userId ${msg.header.userId}"
            PermissionCheck.ejectUserForFailedPermission(msg.header.meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
            state
          }
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

  private def getAllowSendPluginMessage(pluginInstance: PluginModel, chatMessage: GroupChatMessage, user: UserState): Boolean = {
    (for {
      rawPluginName <- chatMessage.metadata.get("pluginName")
      pluginName = rawPluginName.toString
      rawCustomValue <- chatMessage.metadata.get("custom")
      customStr = rawCustomValue.toString
      custom = customStr.toBooleanOption.getOrElse(false)
      plugin = getPluginManifestContentByName(pluginInstance, pluginName).get
    } yield {
      val isCustomPluginMessage = pluginName.nonEmpty && custom

      def checkServerCommandPermission(permissionList: Option[List[String]]): Boolean = {
        permissionList match {
          case Some(permissionList) => isRoleAllowedToSendMessage(permissionList, user)
          case None                 => true
        }
      }
      if (isCustomPluginMessage) {
        val customMessagePermissions = ServerCommands.getPluginPermissionForCustomMessage(plugin)
        checkServerCommandPermission(customMessagePermissions)
      } else true
    }).getOrElse(true)
  }

  private def isRoleAllowedToSendMessage(allowedRoles: List[String], user: UserState): Boolean = {
    checkPermission(user, allowedRoles).contains(true)
  }

}
