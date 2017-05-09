package org.bigbluebutton.core.apps

import org.bigbluebutton.core.models.{ DirectChats, PublicChats }

import scala.collection.mutable.ArrayBuffer

object ChatModel {
  def getChatHistory(chatModel: ChatModel): Array[Map[String, String]] = {
    chatModel.getChatHistory()
  }
}

class ChatModel {

  val directChats = new DirectChats
  val publicChats = new PublicChats

  private val messages = new ArrayBuffer[Map[String, String]]()

  def getChatHistory(): Array[Map[String, String]] = {
    val history = new Array[Map[String, String]](messages.size)
    messages.copyToArray(history)

    history
  }

  def addNewChatMessage(msg: Map[String, String]) {
    messages append msg
  }

  def clearPublicChatHistory() {
    messages.clear();
  }
}

