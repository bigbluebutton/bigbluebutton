package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.MessageSender
import org.bigbluebutton.core.api._
import com.google.gson.Gson
import scala.collection.mutable.HashMap
import collection.JavaConverters._
import scala.collection.JavaConversions._
import java.util.ArrayList
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.messaging.Util

class ChatEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: GetChatHistoryReply => handleGetChatHistoryReply(msg)
      case msg: SendPublicMessageEvent => handleSendPublicMessageEvent(msg)
      case msg: SendPrivateMessageEvent => handleSendPrivateMessageEvent(msg)
      case _ => // do nothing
    }
  }

  private def handleGetChatHistoryReply(msg: GetChatHistoryReply) {
    val json = ChatMessageToJsonConverter.getChatHistoryReplyToJson(msg)
    service.send(MessagingConstants.FROM_CHAT_CHANNEL, json)
  }

  private def handleSendPublicMessageEvent(msg: SendPublicMessageEvent) {
    val json = ChatMessageToJsonConverter.sendPublicMessageEventToJson(msg)
    service.send(MessagingConstants.FROM_CHAT_CHANNEL, json)
  }

  private def handleSendPrivateMessageEvent(msg: SendPrivateMessageEvent) {
    val json = ChatMessageToJsonConverter.sendPrivateMessageEventToJson(msg)
    service.send(MessagingConstants.FROM_CHAT_CHANNEL, json)
  }
}