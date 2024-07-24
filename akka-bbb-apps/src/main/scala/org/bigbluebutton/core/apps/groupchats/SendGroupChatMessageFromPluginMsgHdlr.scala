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

trait SendGroupChatMessageFromPluginMsgHdlr extends HandlerHelpers {
  this: GroupChatHdlrs =>

  def handle(msg: SendGroupChatMessageFromPluginMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val chatDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("chat")
    var chatLocked: Boolean = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      groupChat <- state.groupChats.find(msg.body.chatId)
    } yield {
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

    if (!chatDisabled && !(applyPermissionCheck && chatLocked)) {
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

          val pluginMessageMetadata = {
            val baseMap = Map("pluginName" -> msg.body.msg.metadata.pluginName)
            if (msg.body.msg.metadata.pluginCustomMetadata.nonEmpty) {
              baseMap + ("pluginCustomMetadata" -> msg.body.msg.metadata.pluginCustomMetadata)
            } else {
              baseMap
            }
          }

          val gcm = GroupChatApp.toGroupChatMessage(sender, msg.body.msg, emphasizedText, pluginMessageMetadata)
          val gcs = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcm, GroupChatMessageType.PLUGIN)

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
