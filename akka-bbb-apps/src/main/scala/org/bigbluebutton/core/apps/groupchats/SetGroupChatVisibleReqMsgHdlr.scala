package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.ChatUserDAO
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, LogHelper }

trait SetGroupChatVisibleReqMsgHdlr {
  def handle(msg: SetGroupChatVisibleReqMsg, liveMeeting: LiveMeeting): Unit = {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      ChatUserDAO.updateChatVisible(liveMeeting.props.meetingProp.intId, msg.body.chatId, user.intId, msg.body.visible)
    }
  }
}
