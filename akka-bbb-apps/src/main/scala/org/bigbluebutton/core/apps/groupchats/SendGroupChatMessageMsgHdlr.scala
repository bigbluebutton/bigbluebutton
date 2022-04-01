package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
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
        val gcm = GroupChatApp.toGroupChatMessage(sender, msg.body.msg)
        val gcs = GroupChatApp.addGroupChatMessage(chat, state.groupChats, gcm)

        val event = buildGroupChatMessageBroadcastEvtMsg(
          liveMeeting.props.meetingProp.intId,
          msg.header.userId, msg.body.chatId, gcm
        )

        bus.outGW.send(event)

        state.update(gcs)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    } else { state }
  }

}
