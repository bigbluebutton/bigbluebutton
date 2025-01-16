package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.msgs.ChatMessageVO

import scala.collection.mutable.ArrayBuffer

object ChatModel {
  def getChatHistory(chatModel: ChatModel): Array[ChatMessageVO] = {
    chatModel.messages.toArray
  }

  def addNewChatMessage(chatModel: ChatModel, msg: ChatMessageVO): Unit = {
    chatModel.messages.append(msg)
  }

  def clearPublicChatHistory(chatModel: ChatModel): Unit = {
    chatModel.messages.clear()
  }
}

class ChatModel {
  private val messages = new ArrayBuffer[ChatMessageVO]()
}
