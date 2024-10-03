package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.{ GroupChatAccess, GroupChatMessageType, GroupChatMsgFromUser, GroupChatMsgToUser, GroupChatUser }
import org.bigbluebutton.core.db.ChatMessageDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

object GroupChatApp {
  def getGroupChatOfUsers(userId: String, participantIds: Vector[String], state: MeetingState2x): Option[GroupChat] = {
    state.groupChats.findAllPrivateChatsForUser(userId)
      .find(groupChat => participantIds.forall(groupChat.users.map(u => u.id).contains))
  }

  val MAIN_PUBLIC_CHAT = "MAIN-PUBLIC-GROUP-CHAT"

  def createGroupChat(access: String, createBy: GroupChatUser,
                      users: Vector[GroupChatUser], msgs: Vector[GroupChatMessage]): GroupChat = {
    val gcId = GroupChatFactory.genId()
    GroupChatFactory.create(gcId, access, createBy, users, msgs)
  }

  def toGroupChatMessage(sender: GroupChatUser, msg: GroupChatMsgFromUser, emphasizedText: Boolean): GroupChatMessage = {
    val now = System.currentTimeMillis()
    val id = GroupChatFactory.genId()
    GroupChatMessage(id, now, msg.correlationId, now, now, sender, emphasizedText, msg.message, msg.replyToMessageId, msg.metadata)
  }

  def toMessageToUser(msg: GroupChatMessage): GroupChatMsgToUser = {
    GroupChatMsgToUser(id = msg.id, timestamp = msg.timestamp, correlationId = msg.correlationId,
      sender = msg.sender, chatEmphasizedText = msg.chatEmphasizedText, message = msg.message)
  }

  def addGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats,
                          msg: GroupChatMessage, messageType: String = GroupChatMessageType.DEFAULT): GroupChats = {
    if (msg.sender.id == SystemUser.ID) {
      ChatMessageDAO.insertSystemMsg(meetingId, chat.id, msg.message, messageType, Map(), msg.sender.name)
    } else {
      ChatMessageDAO.insert(meetingId, chat.id, msg, messageType)
    }

    val c = chat.add(msg)
    chats.update(c)
  }

  def updateGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats, msg: GroupChatMessage): GroupChats = {
    ChatMessageDAO.update(meetingId, chat.id, msg.id, msg.message)

    val c = chat.update(msg)
    chats.update(c)
  }

  def deleteGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats, msg: GroupChatMessage, deletedBy: String): GroupChats = {
    ChatMessageDAO.softDelete(meetingId, chat.id, msg.id, deletedBy)

    val c = chat.delete(msg.id)
    chats.update(c)
  }

  def findGroupChatUser(userId: String, users: Users2x): Option[GroupChatUser] = {
    Users2x.findWithIntId(users, userId) match {
      case Some(u) => Some(GroupChatUser(u.intId, u.name, u.role))
      case None =>
        if (userId == SystemUser.ID) {
          Some(GroupChatUser(SystemUser.ID))
        } else {
          None
        }
    }
  }

  def createDefaultPublicGroupChat(): GroupChat = {
    val createBy = GroupChatUser(SystemUser.ID)
    GroupChatFactory.create(MAIN_PUBLIC_CHAT, GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty)
  }

  def createTestPublicGroupChat(state: MeetingState2x): MeetingState2x = {
    val createBy = GroupChatUser(SystemUser.ID)
    val defaultPubGroupChat = GroupChatFactory.create(
      "TEST_GROUP_CHAT",
      GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty
    )
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
        val emphasizedText = sender.role == Roles.MODERATOR_ROLE
        val gcm1 = GroupChatApp.toGroupChatMessage(sender, msg, emphasizedText)
        val gcs1 = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcm1)
        state.update(gcs1)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    }

    val sender = GroupChatUser(SystemUser.ID)
    val h1 = GroupChatMsgFromUser(correlationId = "cor1", sender = sender, message = "Hello Foo!", replyToMessageId = "")
    val h2 = GroupChatMsgFromUser(correlationId = "cor2", sender = sender, message = "Hello Bar!", replyToMessageId = "")
    val h3 = GroupChatMsgFromUser(correlationId = "cor3", sender = sender, message = "Hello Baz!", replyToMessageId = "")
    val state1 = addH(state, SystemUser.ID, liveMeeting, h1)
    val state2 = addH(state1, SystemUser.ID, liveMeeting, h2)
    val state3 = addH(state2, SystemUser.ID, liveMeeting, h3)
    state3
  }
}
