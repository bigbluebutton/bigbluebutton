package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.ClientSettings.{ getConfigPropertyValueByPath, getConfigPropertyValueByPathAsBooleanOrElse }
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
    var chatLocked: Boolean = false
    var chatLockedForUser: Boolean = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      groupChat <- state.groupChats.find(msg.body.chatId)
    } yield {
      if (groupChat.access == GroupChatAccess.PUBLIC && user.userLockSettings.disablePublicChat) {
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
          if (modMembers.length == 0) {
            chatLocked = permissions.disablePrivChat
          }
        } else {
          chatLocked = permissions.disablePubChat
        }
      }
    }

    if (!chatDisabled && !(applyPermissionCheck && chatLocked) && !chatLockedForUser) {
      val newState = for {
        sender <- GroupChatApp.findGroupChatUser(msg.header.userId, liveMeeting.users2x)
        chat <- state.groupChats.find(msg.body.chatId)
      } yield {
        val chatIsPrivate = chat.access == GroupChatAccess.PRIVATE;
        val userIsAParticipant = chat.users.filter(u => u.id == sender.id).length > 0;

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

          val gcm = GroupChatApp.toGroupChatMessage(sender, msg.body.msg, emphasizedText, msg.body.msg.metadata)
          val gcs = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcm, messageType)

          val event = buildGroupChatMessageBroadcastEvtMsg(
            liveMeeting.props.meetingProp.intId,
            msg.header.userId, msg.body.chatId, gcm
          )

          bus.outGW.send(event)

          state.update(gcs)
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
