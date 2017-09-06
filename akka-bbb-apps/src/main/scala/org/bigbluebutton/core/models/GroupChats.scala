package org.bigbluebutton.core.models

import org.bigbluebutton.core.util.RandomStringGenerator

object GroupChatFactory {
  def create(chats: GroupChats, name: String, open: Boolean, requesterId: String): GroupChat = {
    val id = RandomStringGenerator.randomAlphanumericString(20)
    new GroupChat(id, name, open, requesterId, Map.empty, Map.empty)
  }
}

case class GroupChats(chats: collection.immutable.Map[String, GroupChat]) {
  def add(chat: GroupChat): GroupChats = copy(chats = chats + (chat.id -> chat))
  def remove(id: String): GroupChats = {
    if (chats.contains(id)) copy(chats = chats - id) else this
  }
}

case class GroupChatUser(id: String, name: String)
case class GroupChat(id: String, name: String, open: Boolean, createdBy: String,
                     users: collection.immutable.Map[String, GroupChatUser],
                     msgs:  collection.immutable.Map[String, GroupChatMessage]) {
  def add(user: GroupChatUser): GroupChat = copy(users = users + (user.id -> user))
  def removeUser(id: String): GroupChat = if (users.contains(id)) copy(users = users - id) else this
  def add(msg: GroupChatMessage): GroupChat = copy(msgs = msgs + (msg.id -> msg))
  def removeMsg(id: String): GroupChat = copy(msgs = msgs - id)
  def updateMsg(msg: GroupChatMessage): GroupChat = add(msg)
}

case class GroupChatMessage(id: String, createdOn: Long, updatedOn: Long, sender: String,
                            font: String, size: Int, color: String, message: String)
