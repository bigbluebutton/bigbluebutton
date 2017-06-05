package org.bigbluebutton.core.apps

import org.bigbluebutton.core.running.LiveMeeting

trait ChatModelTrait {
  this: LiveMeeting =>

  def getChatHistory(): Array[Map[String, String]] = {
    ChatModel.getChatHistory(chatModel)
  }

  def addNewChatMessage(msg: Map[String, String]) = {
    chatModel.addNewChatMessage(msg)
  }

  def clearPublicChatHistory(): Unit = {
    chatModel.clearPublicChatHistory()
  }
}
