package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, LogHelper }

trait UserTypingPubMsgHdlr extends LogHelper {
  def handle(msg: UserTypingPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: UserTypingPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserTypingEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserTypingEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = UserTypingEvtMsgBody(msg.body.chatId, msg.header.userId)
      val event = UserTypingEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }
    broadcastEvent(msg)
  }
}
