package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.{ OpenGroupChatWindowReqMsg }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait OpenGroupChatWindowReqMsgHdlr {
  this: GroupChatHdlrs =>

  def handle(msg: OpenGroupChatWindowReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    state
  }
}
