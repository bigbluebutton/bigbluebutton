package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.GetGroupChatsReqMsg
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait GetGroupChatsReqMsgHdlr {
  this: GroupChatsApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetGroupChatsReqMsg(msg: GetGroupChatsReqMsg): Unit = {

  }
}
