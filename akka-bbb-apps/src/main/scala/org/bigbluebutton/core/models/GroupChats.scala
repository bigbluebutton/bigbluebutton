package org.bigbluebutton.core.models

import org.bigbluebutton.common2.msgs.{ GroupChatAccess, GroupChatUser }
import org.bigbluebutton.core.util.RandomStringGenerator

object GroupChatFactory {
  def genId(): String = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8)
  def create(id: String, name: String, access: String, createdBy: GroupChatUser,
             users: Vector[GroupChatUser], msgs: Vector[GroupChatMessage]): GroupChat = {
    new GroupChat(id, name, access, createdBy, users, msgs)
  }

}

case class GroupChats(chats: collection.immutable.Map[String, GroupChat]) {
  def find(id: String): Option[GroupChat] = chats.get(id)
  def add(chat: GroupChat): GroupChats = copy(chats = chats + (chat.id -> chat))
  def remove(id: String): GroupChats = copy(chats = chats - id)
  def update(chat: GroupChat): GroupChats = add(chat)
  def findAllPublicChats(): Vector[GroupChat] = chats.values.toVector filter (c => c.access == GroupChatAccess.PUBLIC)
  def findAllPrivateChatsForUser(id: String) = chats.values.toVector filter (c =>
    c.access == GroupChatAccess.PRIVATE && c.isUserMemberOf(id))
  def getAllGroupChatsInMeeting(): Vector[GroupChat] = chats.values.toVector
}

case class GroupChat(id: String, name: String, access: String, createdBy: GroupChatUser,
                     users: Vector[GroupChatUser],
                     msgs:  Vector[GroupChatMessage]) {
  def findMsgWithId(id: String): Option[GroupChatMessage] = msgs.find(m => m.id == id)
  def add(user: GroupChatUser): GroupChat = copy(users = users :+ user)
  def remove(userId: String): GroupChat = copy(users = users.filterNot(u => u.id == userId))
  def add(msg: GroupChatMessage): GroupChat = copy(msgs = msgs :+ msg)
  def delete(msgId: String): GroupChat = copy(msgs = msgs.filterNot(m => m.id == msgId))
  def update(msg: GroupChatMessage): GroupChat = add(msg)
  def isUserMemberOf(userId: String): Boolean = users.find(p => p.id == userId).isDefined
  def clearMessages(): GroupChat = copy(msgs = Vector())
}

case class GroupChatMessage(id: String, timestamp: Long, correlationId: String, createdOn: Long,
                            updatedOn: Long, sender: GroupChatUser, color: String, message: String)

case class GroupChatWindow(windowId: String, chatIds: Vector[String], keepOpen: Boolean, openedBy: String) {

}
