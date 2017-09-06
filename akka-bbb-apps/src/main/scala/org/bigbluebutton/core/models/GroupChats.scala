package org.bigbluebutton.core.models

import org.bigbluebutton.core.util.RandomStringGenerator

object GroupChatFactory {
  def genId(): String = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8)
  def create(id: String, name: String, open: Boolean, requesterId: String): GroupChat = {
    new GroupChat(id, name, open, requesterId, Map.empty, Map.empty)
  }
}

case class GroupChats(chats: collection.immutable.Map[String, GroupChat]) {
  def add(chat: GroupChat): GroupChats = copy(chats = chats + (chat.id -> chat))
  def remove(id: String): GroupChats = copy(chats = chats - id)
  def update(chat: GroupChat): GroupChats = add(chat)
}

case class GroupChatUser(id: String, name: String)
case class GroupChat(id: String, name: String, open: Boolean, createdBy: String,
                     users: collection.immutable.Map[String, GroupChatUser],
                     msgs:  collection.immutable.Map[String, GroupChatMessage]) {
  def add(user: GroupChatUser): GroupChat = copy(users = users + (user.id -> user))
  def remove(userId: String): GroupChat = copy(users = users - userId)
  def add(msg: GroupChatMessage): GroupChat = copy(msgs = msgs + (msg.id -> msg))
  def delete(msgId: String): GroupChat = copy(msgs = msgs - msgId)
  def update(msg: GroupChatMessage): GroupChat = add(msg)
}

case class GroupChatMessage(id: String, createdOn: Long, updatedOn: Long, sender: String,
                            font: String, size: Int, color: String, message: String)
