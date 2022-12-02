package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, LogHelper }

trait AddMessageReactionReqMsgHdlr extends LogHelper {

  def handle(msg: AddMessageReactionReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("ADDING MESSAGE REACTION")

    def broadcastEvent(userId: String, chatId: String, messageId: String, emojiId: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(AddMessageReactionEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AddMessageReactionEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
      val body = AddMessageReactionEvtMsgBody(userId, chatId, messageId, emojiId)
      val event = AddMessageReactionEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg.body.userId, msg.body.chatId, msg.body.messageId, msg.body.emojiId)
  }

}
