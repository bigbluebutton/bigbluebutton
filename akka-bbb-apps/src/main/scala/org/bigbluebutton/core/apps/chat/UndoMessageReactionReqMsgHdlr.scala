package org.bigbluebutton.core.apps.chat

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting, LogHelper }

trait UndoMessageReactionReqMsgHdlr extends LogHelper {

  def handle(msg: UndoMessageReactionReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("REMOVING MESSAGE REACTION")

    def broadcastEvent(userId: String, chatId: String, messageId: String, emojiId: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UndoMessageReactionEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UndoMessageReactionEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
      val body = UndoMessageReactionEvtMsgBody(userId, chatId, messageId, emojiId)
      val event = UndoMessageReactionEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg.body.userId, msg.body.chatId, msg.body.messageId, msg.body.emojiId)
  }

}
