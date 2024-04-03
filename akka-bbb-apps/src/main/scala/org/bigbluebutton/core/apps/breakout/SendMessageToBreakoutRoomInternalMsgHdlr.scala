package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs.{ GroupChatAccess, GroupChatMessageType, GroupChatMsgFromUser }
import org.bigbluebutton.core.api.SendMessageToBreakoutRoomInternalMsg
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.SystemUser
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }

trait SendMessageToBreakoutRoomInternalMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSendMessageToBreakoutRoomInternalMsg(msg: SendMessageToBreakoutRoomInternalMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val newState = for {
      sender <- GroupChatApp.findGroupChatUser(SystemUser.ID, liveMeeting.users2x)
      chat <- state.groupChats.find(GroupChatApp.MAIN_PUBLIC_CHAT)
    } yield {
      val groupChatMsgFromUser = GroupChatMsgFromUser(sender.id, sender.copy(name = msg.senderName), msg.msg)
      val gcm = GroupChatApp.toGroupChatMessage(sender.copy(name = msg.senderName), groupChatMsgFromUser, emphasizedText = true)
      val gcs = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcm, GroupChatMessageType.BREAKOUTROOM_MOD_MSG)

      val event = buildGroupChatMessageBroadcastEvtMsg(
        liveMeeting.props.meetingProp.intId,
        msg.senderName, GroupChatApp.MAIN_PUBLIC_CHAT, gcm
      )

      bus.outGW.send(event)

      state.update(gcs)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
