package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.{ GroupChatMsgFromUser, GroupChatUser, SendGroupChatMessageMsg }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.{ BbbSystemConst, MeetingState2x }
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

trait SendGroupChatMessageMsgHdlr {

  def handle(msg: SendGroupChatMessageMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val newState = for {
      sender <- GroupChat.sender(msg.header.userId, liveMeeting.users2x)
      chat <- state.groupChats.find(msg.body.chatId)
    } yield {
      val gcs = GroupChat.addNewGroupChatMessage(sender, chat, state.groupChats, msg.body.chatMsg)
      state.update(gcs)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }

}
