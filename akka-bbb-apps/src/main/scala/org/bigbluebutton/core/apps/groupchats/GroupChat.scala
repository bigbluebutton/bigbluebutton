package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.{ GroupChatMsgFromUser, GroupChatUser }
import org.bigbluebutton.core.domain.BbbSystemConst
import org.bigbluebutton.core.models._

object GroupChat {
  def createGroupChat(chatName: String, access: String, userName: String, requesterId: String): GroupChat = {
    val gcId = GroupChatFactory.genId()
    val gcUser = GroupChatUser(requesterId, userName)
    GroupChatFactory.create(gcId, chatName, access, gcUser)
  }

  def addNewGroupChatMessage(sender: GroupChatUser, chat: GroupChat, chats: GroupChats,
                             msg: GroupChatMsgFromUser): GroupChats = {
    val now = System.currentTimeMillis()
    val id = GroupChatFactory.genId()
    val chatMsg = GroupChatMessage(id, now, msg.correlationId, now, now, sender, msg.font,
      msg.size, msg.correlationId, msg.message)
    val c = chat.add(chatMsg)
    chats.update(c)
  }

  def sender(userId: String, users: Users2x): Option[GroupChatUser] = {
    Users2x.findWithIntId(users, userId) match {
      case Some(u) => Some(GroupChatUser(u.intId, u.name))
      case None =>
        if (userId == BbbSystemConst.SYSTEM_USER) {
          Some(GroupChatUser(BbbSystemConst.SYSTEM_USER, BbbSystemConst.SYSTEM_USER))
        } else {
          None
        }
    }
  }
}
