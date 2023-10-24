package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PluginDataChannelDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait DispatchPluginDataChannelMessageMsgHdlr extends HandlerHelpers {
  //  this: GroupChatHdlrs =>

  def handle(msg: DispatchPluginDataChannelMessageMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    //    val pluginDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("plugin")

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      //      if (user.role != Roles.MODERATOR_ROLE && user.locked) {
      //        val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
      //        if (groupChat.access == GroupChatAccess.PRIVATE) {
      //          val modMembers = groupChat.users.filter(cu => Users2x.findWithIntId(liveMeeting.users2x, cu.id) match {
      //            case Some(user) => user.role == Roles.MODERATOR_ROLE
      //            case None       => false
      //          })
      //          // don't lock private chats that involve a moderator
      //          if (modMembers.length == 0) {
      //            chatLocked = permissions.disablePrivChat
      //          }
      //        } else {
      //          chatLocked = permissions.disablePubChat
      //        }
      //      }

      //Check plugin exists
      //Check channel exists
      //Check plugin write permission
      //Check if user has permission to write into this channel
      PluginDataChannelDAO.insert(
        meetingId,
        msg.body.pluginName,
        msg.body.dataChannel,
        msg.header.userId,
        msg.body.msgJson,
        msg.body.toRole,
        msg.body.toUserId
      )
    }
    //
    //    if (!chatDisabled && !(applyPermissionCheck && chatLocked)) {
    //      val newState = for {
    //        sender <- GroupChatApp.findGroupChatUser(msg.header.userId, liveMeeting.users2x)
    //        chat <- state.groupChats.find(msg.body.chatId)
    //      } yield {
    //        val chatIsPrivate = chat.access == GroupChatAccess.PRIVATE;
    //        val userIsAParticipant = chat.users.filter(u => u.id == sender.id).length > 0;
    //
    //        if ((chatIsPrivate && userIsAParticipant) || !chatIsPrivate) {
    //          val gcm = GroupChatApp.toGroupChatMessage(sender, msg.body.msg)
    //          val gcs = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcm)
    //
    //          val event = buildGroupChatMessageBroadcastEvtMsg(
    //            liveMeeting.props.meetingProp.intId,
    //            msg.header.userId, msg.body.chatId, gcm
    //          )
    //
    //          bus.outGW.send(event)
    //
    //          state.update(gcs)
    //        } else {
    //          val reason = "User isn't a participant of the chat"
    //          PermissionCheck.ejectUserForFailedPermission(msg.header.meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    //          state
    //        }
    //
    //      }
    //
    //      newState match {
    //        case Some(ns) => ns
    //        case None     => state
    //      }
    //    } else { state }
  }

}
