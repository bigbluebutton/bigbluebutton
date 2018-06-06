package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.msgs.ChatMessageVO
import scala.collection.mutable.ArrayBuffer

object ChatModel {
  def getChatHistory(chatModel: ChatModel): Array[ChatMessageVO] = {
    chatModel.messages.toArray
  }

  def addNewChatMessage(chatModel: ChatModel, msg: ChatMessageVO) {
    chatModel.messages.append(msg)
  }

  def clearPublicChatHistory(chatModel: ChatModel) {
    chatModel.messages.clear()
  }
}

class ChatModel {
  private val messages = new ArrayBuffer[ChatMessageVO]()
}
