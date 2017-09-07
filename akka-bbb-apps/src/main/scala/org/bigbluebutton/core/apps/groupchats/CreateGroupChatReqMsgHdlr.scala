package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.CreateGroupChatReqMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.GroupChatFactory
import org.bigbluebutton.core.running.{LiveMeeting, OutMsgRouter}

trait CreateGroupChatReqMsgHdlr {
  this: GroupChatsApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleCreateGroupChatReqMsg(msg: CreateGroupChatReqMsg, state: MeetingState2x): MeetingState2x = {
    val gcId = GroupChatFactory.genId()
    val gc = GroupChatFactory.create(gcId, msg.body.name, msg.body.open, msg.body.requesterId)
    val groupChats = state.groupChats.add(gc)
    val newState = state.update(groupChats)

  }
}
