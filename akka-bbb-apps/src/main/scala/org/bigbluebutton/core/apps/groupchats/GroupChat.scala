package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.{ GroupChatAccess, GroupChatMsgFromUser, GroupChatUser }
import org.bigbluebutton.core.domain.{ BbbSystemConst, MeetingState2x }
import org.bigbluebutton.core.models._

object GroupChatApp {
  def createGroupChat(chatName: String, access: String, createBy: GroupChatUser): GroupChat = {
    val gcId = GroupChatFactory.genId()
    GroupChatFactory.create(gcId, chatName, access, createBy)
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

  def createDefaultPublicGroupChat(state: MeetingState2x): MeetingState2x = {
    val createBy = GroupChatUser(BbbSystemConst.SYSTEM_USER, BbbSystemConst.SYSTEM_USER)
    val defaultPubGroupChat = createGroupChat("PUBLIC", GroupChatAccess.PUBLIC, createBy)
    val groupChats = state.groupChats.add(defaultPubGroupChat)
    state.update(groupChats)
  }
}
