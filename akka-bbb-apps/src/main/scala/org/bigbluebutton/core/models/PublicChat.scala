package org.bigbluebutton.core.models

import org.bigbluebutton.core.util.RandomStringGenerator

import scala.collection.mutable

object PublicChats {
  def create(chats: PublicChats): PublicChat = {
    val id = RandomStringGenerator.randomAlphanumericString(20)
    val chat = new PublicChat(id)
    chats.save(chat)
    chat
  }

  def find(id: String, chats: PublicChats): Option[PublicChat] = {
    chats.toVector.find { chat => chat.id == id }
  }
}

class PublicChats {
  private var chats: collection.immutable.HashMap[String, PublicChat] = new collection.immutable.HashMap[String, PublicChat]

  private def toVector: Vector[PublicChat] = chats.values.toVector

  private def save(chat: PublicChat): PublicChat = {
    chats += chat.id -> chat
    chat
  }

  private def remove(id: String): Option[PublicChat] = {
    for {
      chat <- chats.get(id)
    } yield {
      chat
    }
  }
}

object PublicChat {
  def append(chat: PublicChat, msg: PublicChatMessage): PublicChatMessage = {
    chat.append(msg)
  }

  def getMessages(chat: PublicChat): Vector[PublicChatMessage] = {
    chat.toVector
  }
}

class PublicChat(val id: String) {
  private var messages: collection.mutable.Queue[PublicChatMessage] = new mutable.Queue[PublicChatMessage]()

  private def toVector: Vector[PublicChatMessage] = messages.toVector

  private def append(msg: PublicChatMessage): PublicChatMessage = {
    messages += msg
    msg
  }
}

case class PublicChatMessage(msgId: String, timestamp: Long, from: UserIdAndName, message: ChatMessage)
