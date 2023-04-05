package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.common2.msgs.GroupChatUser
import org.bigbluebutton.core.models.VoiceUserState

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class ChatUserDbModel(
    chatId:     String,
    meetingId:  String,
    userId:     String,
    lastSeenAt: Long,
    typingAt:   Option[java.sql.Timestamp]
)

class ChatUserDbTableDef(tag: Tag) extends Table[ChatUserDbModel](tag, None, "chat_user") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val lastSeenAt = column[Long]("lastSeenAt")
  val typingAt = column[Option[java.sql.Timestamp]]("typingAt")
  //  val chat = foreignKey("chat_message_chat_fk", (chatId, meetingId), ChatTable.chats)(c => (c.chatId, c.meetingId), onDelete = ForeignKeyAction.Cascade)
  //  val sender = foreignKey("chat_message_sender_fk", senderId, UserTable.users)(_.userId, onDelete = ForeignKeyAction.SetNull)

  override def * = (chatId, meetingId, userId, lastSeenAt, typingAt) <> (ChatUserDbModel.tupled, ChatUserDbModel.unapply)
}

object ChatUserDAO {

  def insert(meetingId: String, chatId: String, groupChatUser: GroupChatUser) = {
    ChatUserDAO.insertUser(meetingId, chatId, groupChatUser.id)
  }

  def insertUserPublicChat(meetingId: String, userId: String) = {
    ChatUserDAO.insertUser(meetingId, "MAIN-PUBLIC-GROUP-CHAT", userId)
  }

  def insertUser(meetingId: String, chatId: String, userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[ChatUserDbTableDef].insertOrUpdate(
        ChatUserDbModel(
          userId = userId,
          chatId = chatId,
          meetingId = meetingId,
          lastSeenAt = 0,
          typingAt = None
        )
      )
    ).onComplete {
        case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on ChatUser table!")
        case Failure(e)            => println(s"Error inserting ChatUser: $e")
      }
  }

  def updateUserTyping(meetingId: String, chatId: String, userId: String) = {
    println(meetingId, chatId, userId)
    println(new java.sql.Timestamp(System.currentTimeMillis()))
    DatabaseConnection.db.run(
      TableQuery[ChatUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === (if (chatId == "public") "MAIN-PUBLIC-GROUP-CHAT" else chatId))
        .filter(_.userId === userId)
        .map(u => (u.typingAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
        case Success(rowsAffected) => println(s"$rowsAffected row(s) updated typingAt on chat_user table!")
        case Failure(e)            => println(s"Error updating typingAt on chat_user table: $e")
      }
  }

}