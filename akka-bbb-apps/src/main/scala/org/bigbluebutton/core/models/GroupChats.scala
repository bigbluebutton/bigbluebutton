package org.bigbluebutton.core.models

import org.bigbluebutton.common2.msgs.{ GroupChatMessage, GroupChatUser }
import org.bigbluebutton.core.util.RandomStringGenerator

object GroupChatFactory {
  def genId(): String = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8)
  def create(id: String, name: String, open: Boolean, createdBy: GroupChatUser): GroupChat = {
    new GroupChat(id, name, open, createdBy, Map.empty, Map.empty)
  }
}

case class GroupChats(chats: collection.immutable.Map[String, GroupChat]) {
  def find(id: String): Option[GroupChat] = chats.get(id)
  def add(chat: GroupChat): GroupChats = copy(chats = chats + (chat.id -> chat))
  def remove(id: String): GroupChats = copy(chats = chats - id)
  def update(chat: GroupChat): GroupChats = add(chat)
  def findAllPublicChats(): Vector[GroupChat] = chats.values.toVector filter (c => c.publicChat)
  def findAllPrivateChatsForUser(id: String) = chats.values.toVector filter (c => c.isUserMemberOf(id))
}

case class GroupChat(id: String, name: String, publicChat: Boolean, createdBy: GroupChatUser,
                     users: collection.immutable.Map[String, GroupChatUser],
                     msgs:  collection.immutable.Map[String, GroupChatMessage]) {
  def add(user: GroupChatUser): GroupChat = copy(users = users + (user.id -> user))
  def remove(userId: String): GroupChat = copy(users = users - userId)
  def add(msg: GroupChatMessage): GroupChat = copy(msgs = msgs + (msg.id -> msg))
  def delete(msgId: String): GroupChat = copy(msgs = msgs - msgId)
  def update(msg: GroupChatMessage): GroupChat = add(msg)
  def isUserMemberOf(userId: String): Boolean = users.contains(userId)
}

