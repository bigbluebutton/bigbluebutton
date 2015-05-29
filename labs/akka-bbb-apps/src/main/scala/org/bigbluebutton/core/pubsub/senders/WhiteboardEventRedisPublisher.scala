package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import scala.collection.JavaConversions._
import org.bigbluebutton.conference.service.whiteboard.WhiteboardKeyUtil
import scala.collection.immutable.StringOps
import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.common.messages.MessagingConstants

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

class WhiteboardEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: GetWhiteboardShapesReply => handleGetWhiteboardShapesReply(msg)
      case msg: SendWhiteboardAnnotationEvent => handleSendWhiteboardAnnotationEvent(msg)
      case msg: ClearWhiteboardEvent => handleClearWhiteboardEvent(msg)
      case msg: UndoWhiteboardEvent => handleUndoWhiteboardEvent(msg)
      case msg: WhiteboardEnabledEvent => handleWhiteboardEnabledEvent(msg)
      case msg: IsWhiteboardEnabledReply => handleIsWhiteboardEnabledReply(msg)
      case _ => //println("Unhandled message in UsersClientMessageSender")
    }
  }

  private def handleGetWhiteboardShapesReply(msg: GetWhiteboardShapesReply) {
    val json = WhiteboardMessageToJsonConverter.getWhiteboardShapesReplyToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {
    val json = WhiteboardMessageToJsonConverter.sendWhiteboardAnnotationEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
    val json = WhiteboardMessageToJsonConverter.clearWhiteboardEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
    val json = WhiteboardMessageToJsonConverter.undoWhiteboardEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleWhiteboardEnabledEvent(msg: WhiteboardEnabledEvent) {
    val json = WhiteboardMessageToJsonConverter.whiteboardEnabledEventToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

  private def handleIsWhiteboardEnabledReply(msg: IsWhiteboardEnabledReply) {
    val json = WhiteboardMessageToJsonConverter.isWhiteboardEnabledReplyToJson(msg)
    service.send(MessagingConstants.FROM_WHITEBOARD_CHANNEL, json)
  }

}