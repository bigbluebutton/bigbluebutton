package org.bigbluebutton.core.models

class GroupChats {
  private var chats: collection.immutable.HashMap[String, GroupChat] = new collection.immutable.HashMap[String, GroupChat]

  private def toVector: Vector[GroupChat] = chats.values.toVector

  private def save(chat: GroupChat): GroupChat = {
    chats += chat.id -> chat
    chat
  }

  private def remove(id: String): Option[GroupChat] = {
    for {
      chat <- chats.get(id)
    } yield {
      chat
    }
  }
}

case class GroupChat(id: String, name: String, open: Boolean, users: Vector[String], messages: Vector[GroupChatMessage])
case class GroupChatMessage(msgId: String, timestamp: Long, sender: String,
                            font: String, size: Int, color: String, message: String)
