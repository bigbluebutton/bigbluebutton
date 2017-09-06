package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.CreateGroupChatReqMsg
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait CreateGroupChatReqMsgHdlr {
  this: GroupChatsApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleCreateGroupChatReqMsg(msg: CreateGroupChatReqMsg): Unit = {

  }
}
