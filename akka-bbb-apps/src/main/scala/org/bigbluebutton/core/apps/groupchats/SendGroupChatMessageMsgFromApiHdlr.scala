package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait SendGroupChatMessageMsgFromApiHdlr extends HandlerHelpers {
  this: GroupChatHdlrs =>

  def handle(msg: SendMessageToChatFromApiSysPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val groupChat = state.groupChats.findDefaultChat();
    if (groupChat.nonEmpty) {
      val chatFound = groupChat.apply(0);
      val systemUser = GroupChatUser(chatFound.createdBy.id, msg.body.userName, "MODERATOR");

      val message = GroupChatMsgFromUser(systemUser.id, systemUser, true, msg.body.message);
      val gcm = GroupChatApp.toGroupChatMessage(systemUser, message);
      val gcs = GroupChatApp.addGroupChatMessage(chatFound, state.groupChats, gcm);

      val event = buildGroupChatMessageBroadcastEvtMsg(
        liveMeeting.props.meetingProp.intId,
        systemUser.id, chatFound.id, gcm
      );

      bus.outGW.send(event)
      state.update(gcs)
    }
    state
  }

}
