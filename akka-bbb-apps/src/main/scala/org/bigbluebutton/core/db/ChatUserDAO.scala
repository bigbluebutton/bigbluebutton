package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.common2.msgs.GroupChatUser

case class ChatUserDbModel(
    chatId:          String,
    meetingId:       String,
    userId:          String,
    lastSeenAt:      Option[java.sql.Timestamp],
    startedTypingAt: Option[java.sql.Timestamp],
    lastTypingAt:    Option[java.sql.Timestamp],
    visible:         Boolean
)

class ChatUserDbTableDef(tag: Tag) extends Table[ChatUserDbModel](tag, None, "chat_user") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val lastSeenAt = column[Option[java.sql.Timestamp]]("lastSeenAt")
  val startedTypingAt = column[Option[java.sql.Timestamp]]("startedTypingAt")
  val lastTypingAt = column[Option[java.sql.Timestamp]]("lastTypingAt")
  val visible = column[Boolean]("visible")
  //  val chat = foreignKey("chat_message_chat_fk", (chatId, meetingId), ChatTable.chats)(c => (c.chatId, c.meetingId), onDelete = ForeignKeyAction.Cascade)
  //  val sender = foreignKey("chat_message_sender_fk", senderId, UserTable.users)(_.userId, onDelete = ForeignKeyAction.SetNull)

  override def * = (chatId, meetingId, userId, lastSeenAt, startedTypingAt, lastTypingAt, visible) <> (ChatUserDbModel.tupled, ChatUserDbModel.unapply)
}

object ChatUserDAO {

  def insert(meetingId: String, chatId: String, groupChatUser: GroupChatUser, visible: Boolean) = {
    ChatUserDAO.insertUser(meetingId, chatId, groupChatUser.id, visible)
  }

  def insertUserPublicChat(meetingId: String, userId: String) = {
    ChatUserDAO.insertUser(meetingId, "MAIN-PUBLIC-GROUP-CHAT", userId, true)
  }

  def insertUser(meetingId: String, chatId: String, userId: String, visible: Boolean) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatUserDbTableDef].insertOrUpdate(
        ChatUserDbModel(
          userId = userId,
          chatId = chatId,
          meetingId = meetingId,
          lastSeenAt = None,
          startedTypingAt = None,
          lastTypingAt = None,
          visible = visible
        )
      )
    )
  }

  def updateUserTyping(meetingId: String, chatId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === (if (chatId == "public") "MAIN-PUBLIC-GROUP-CHAT" else chatId))
        .filter(_.userId === userId)
        .map(u => (u.lastTypingAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

  def updateChatVisible(meetingId: String, chatId: String, userId: String = "", visible: Boolean): Unit = {
    if (chatId != "MAIN-PUBLIC-GROUP-CHAT" && chatId != "public") { //Public chat is always visible
      val baseQuery = TableQuery[ChatUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .filter(_.visible === !visible)
      val updateQuery = if (userId.nonEmpty) {
        baseQuery.filter(_.userId === userId).map(_.visible).update(visible)
      } else {
        baseQuery.map(_.visible).update(visible)
      }
      DatabaseConnection.enqueue(updateQuery)
    }
  }

  def updateChatLastSeen(meetingId: String, chatId: String, userId: String, lastSeenAt: java.sql.Timestamp) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === (if (chatId == "public") "MAIN-PUBLIC-GROUP-CHAT" else chatId))
        .filter(_.userId === userId)
        .map(u => (u.lastSeenAt))
        .update(Some(lastSeenAt))
    )
  }

}
