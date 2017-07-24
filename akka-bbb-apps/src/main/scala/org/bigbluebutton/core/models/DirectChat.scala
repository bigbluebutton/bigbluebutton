package org.bigbluebutton.core.models

import scala.collection.mutable

object DirectChats {

  def create(between: Set[String], chats: DirectChats): DirectChat = {
    val chat = DirectChat(between)
    chats.save(chat)
    chat
  }

  def find(between: Set[String], chats: DirectChats): Option[DirectChat] = {
    chats.toVector.find { c => between subsetOf (c.between) }
  }

}

class DirectChats {
  private var chats: collection.immutable.HashMap[String, DirectChat] = new collection.immutable.HashMap[String, DirectChat]

  def toVector: Vector[DirectChat] = chats.values.toVector

  private def save(chat: DirectChat): DirectChat = {
    chats += chat.id -> chat
    chat
  }

  private def remove(id: String): Option[DirectChat] = {
    for {
      chat <- chats.get(id)
    } yield {
      chats -= chat.id
      chat
    }
  }
}

object DirectChat {
  private def createId(between: Set[String]): String = {
    between.toSeq.sorted.mkString("-")
  }

  def apply(between: Set[String]) = new DirectChat(createId(between), between)
}

class DirectChat(val id: String, val between: Set[String]) {
  private var msgs: collection.mutable.Queue[DirectChatMessage] = new mutable.Queue[DirectChatMessage]()

  def messages: Vector[DirectChatMessage] = msgs.toVector

  def append(msg: DirectChatMessage): DirectChatMessage = {
    msgs += msg
    msg
  }

}

case class DirectChatMessage(msgId: String, timestamp: Long, from: UserIdAndName, to: UserIdAndName, message: ChatMessage)

case class ChatMessage(font: String, size: Int, color: String, message: String)