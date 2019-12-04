package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.{ GroupChatAccess, GroupChatMsgFromUser, GroupChatMsgToUser, GroupChatUser }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

object GroupChatApp {

  val MAIN_PUBLIC_CHAT = "MAIN-PUBLIC-GROUP-CHAT"

  def createGroupChat(chatName: String, access: String, createBy: GroupChatUser,
                      users: Vector[GroupChatUser], msgs: Vector[GroupChatMessage]): GroupChat = {
    val gcId = GroupChatFactory.genId()
    GroupChatFactory.create(gcId, chatName, access, createBy, users, msgs)
  }

  def toGroupChatMessage(sender: GroupChatUser, msg: GroupChatMsgFromUser): GroupChatMessage = {
    val now = System.currentTimeMillis()
    val id = GroupChatFactory.genId()
    GroupChatMessage(id, now, msg.correlationId, now, now, sender, msg.color, msg.message)
  }

  def toMessageToUser(msg: GroupChatMessage): GroupChatMsgToUser = {
    GroupChatMsgToUser(id = msg.id, timestamp = msg.timestamp, correlationId = msg.correlationId,
      sender = msg.sender, color = msg.color, message = msg.message)
  }

  def addGroupChatMessage(chat: GroupChat, chats: GroupChats,
                          msg: GroupChatMessage): GroupChats = {
    val c = chat.add(msg)
    chats.update(c)
  }

  def findGroupChatUser(userId: String, users: Users2x): Option[GroupChatUser] = {
    Users2x.findWithIntId(users, userId) match {
      case Some(u) => Some(GroupChatUser(u.intId, u.name))
      case None =>
        if (userId == SystemUser.ID) {
          Some(GroupChatUser(SystemUser.ID, SystemUser.ID))
        } else {
          None
        }
    }
  }

  def createDefaultPublicGroupChat(): GroupChat = {
    val createBy = GroupChatUser(SystemUser.ID, SystemUser.ID)
    GroupChatFactory.create(MAIN_PUBLIC_CHAT, MAIN_PUBLIC_CHAT, GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty)
  }

  def createTestPublicGroupChat(state: MeetingState2x): MeetingState2x = {
    val createBy = GroupChatUser(SystemUser.ID, SystemUser.ID)
    val defaultPubGroupChat = GroupChatFactory.create("TEST_GROUP_CHAT", "TEST_GROUP_CHAT",
      GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty)
    val groupChats = state.groupChats.add(defaultPubGroupChat)
    state.update(groupChats)
  }

  def getAllGroupChatsInMeeting(state: MeetingState2x): Vector[GroupChat] = {
    state.groupChats.getAllGroupChatsInMeeting()
  }

  def genTestChatMsgHistory(chatId: String, state: MeetingState2x, userId: String, liveMeeting: LiveMeeting): MeetingState2x = {
    def addH(state: MeetingState2x, userId: String, liveMeeting: LiveMeeting, msg: GroupChatMsgFromUser): MeetingState2x = {
      val newState = for {
        sender <- GroupChatApp.findGroupChatUser(userId, liveMeeting.users2x)
        chat <- state.groupChats.find(chatId)
      } yield {

        val gcm1 = GroupChatApp.toGroupChatMessage(sender, msg)
        val gcs1 = GroupChatApp.addGroupChatMessage(chat, state.groupChats, gcm1)
        state.update(gcs1)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    }

    val sender = GroupChatUser(SystemUser.ID, SystemUser.ID)
    val h1 = GroupChatMsgFromUser(correlationId = "cor1", sender = sender,
      color = "red", message = "Hello Foo!")
    val h2 = GroupChatMsgFromUser(correlationId = "cor2", sender = sender,
      color = "red", message = "Hello Bar!")
    val h3 = GroupChatMsgFromUser(correlationId = "cor3", sender = sender,
      color = "red", message = "Hello Baz!")
    val state1 = addH(state, SystemUser.ID, liveMeeting, h1)
    val state2 = addH(state1, SystemUser.ID, liveMeeting, h2)
    val state3 = addH(state2, SystemUser.ID, liveMeeting, h3)
    state3
  }
}
