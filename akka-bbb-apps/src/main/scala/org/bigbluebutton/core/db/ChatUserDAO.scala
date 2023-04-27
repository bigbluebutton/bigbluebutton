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
    typingAt:   Option[java.sql.Timestamp],
    visible:    Boolean
)

class ChatUserDbTableDef(tag: Tag) extends Table[ChatUserDbModel](tag, None, "chat_user") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val lastSeenAt = column[Long]("lastSeenAt")
  val typingAt = column[Option[java.sql.Timestamp]]("typingAt")
  val visible = column[Boolean]("visible")
  //  val chat = foreignKey("chat_message_chat_fk", (chatId, meetingId), ChatTable.chats)(c => (c.chatId, c.meetingId), onDelete = ForeignKeyAction.Cascade)
  //  val sender = foreignKey("chat_message_sender_fk", senderId, UserTable.users)(_.userId, onDelete = ForeignKeyAction.SetNull)

  override def * = (chatId, meetingId, userId, lastSeenAt, typingAt, visible) <> (ChatUserDbModel.tupled, ChatUserDbModel.unapply)
}

object ChatUserDAO {

  def insert(meetingId: String, chatId: String, groupChatUser: GroupChatUser, visible: Boolean) = {
    ChatUserDAO.insertUser(meetingId, chatId, groupChatUser.id, visible)
  }

  def insertUserPublicChat(meetingId: String, userId: String) = {
    ChatUserDAO.insertUser(meetingId, "MAIN-PUBLIC-GROUP-CHAT", userId, true)
  }

  def insertUser(meetingId: String, chatId: String, userId: String, visible: Boolean) = {
    DatabaseConnection.db.run(
      TableQuery[ChatUserDbTableDef].insertOrUpdate(
        ChatUserDbModel(
          userId = userId,
          chatId = chatId,
          meetingId = meetingId,
          lastSeenAt = 0,
          typingAt = None,
          visible = visible
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on ChatUser table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting ChatUser: $e")
      }
  }

  def updateUserTyping(meetingId: String, chatId: String, userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[ChatUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === (if (chatId == "public") "MAIN-PUBLIC-GROUP-CHAT" else chatId))
        .filter(_.userId === userId)
        .map(u => (u.typingAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated typingAt on chat_user table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating typingAt on chat_user table: $e")
      }
  }

  def updateChatVisible(meetingId: String, chatId: String): Unit = {
    if (chatId != "MAIN-PUBLIC-GROUP-CHAT" && chatId != "public") { //Public chat is always visible
      DatabaseConnection.db.run(
        TableQuery[ChatUserDbTableDef]
          .filter(_.meetingId === meetingId)
          .filter(_.chatId === chatId)
          .filter(_.visible === false)
          .map(u => (u.visible))
          .update(true)
      ).onComplete {
          case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated visible on chat_user table!")
          case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating visible on chat_user table: $e")
        }
    }
  }

}