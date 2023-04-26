package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.GroupChatMessage

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class ChatMessageDbModel(
    messageId:          String,
    chatId:             String,
    meetingId:          String,
    correlationId:      String,
    createdTime:        Long,
    chatEmphasizedText: Boolean,
    message:            String,
    senderId:           String,
    senderName:         String,
    senderRole:         String
)

class ChatMessageDbTableDef(tag: Tag) extends Table[ChatMessageDbModel](tag, None, "chat_message") {
  val messageId = column[String]("messageId", O.PrimaryKey)
  val chatId = column[String]("chatId")
  val meetingId = column[String]("meetingId")
  val correlationId = column[String]("correlationId")
  val createdTime = column[Long]("createdTime")
  val chatEmphasizedText = column[Boolean]("chatEmphasizedText")
  val message = column[String]("message")
  val senderId = column[String]("senderId")
  val senderName = column[String]("senderName")
  val senderRole = column[String]("senderRole")
  //  val chat = foreignKey("chat_message_chat_fk", (chatId, meetingId), ChatTable.chats)(c => (c.chatId, c.meetingId), onDelete = ForeignKeyAction.Cascade)
  //  val sender = foreignKey("chat_message_sender_fk", senderId, UserTable.users)(_.userId, onDelete = ForeignKeyAction.SetNull)

  override def * = (messageId, chatId, meetingId, correlationId, createdTime, chatEmphasizedText, message, senderId, senderName, senderRole) <> (ChatMessageDbModel.tupled, ChatMessageDbModel.unapply)
}

object ChatMessageDAO {
  def insert(meetingId: String, chatId: String, groupChatMessage: GroupChatMessage) = {
    DatabaseConnection.db.run(
      TableQuery[ChatMessageDbTableDef].insertOrUpdate(
        ChatMessageDbModel(
          messageId = groupChatMessage.id,
          chatId = chatId,
          meetingId = meetingId,
          correlationId = groupChatMessage.correlationId,
          createdTime = groupChatMessage.timestamp,
          chatEmphasizedText = groupChatMessage.chatEmphasizedText,
          message = groupChatMessage.message,
          senderId = groupChatMessage.sender.id,
          senderName = groupChatMessage.sender.name,
          senderRole = groupChatMessage.sender.role,
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on ChatMessage table!")

          //Set chat visible for all participant users
          ChatUserDAO.updateChatVisible(meetingId, chatId)
        }
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting ChatMessage: $e")
      }
  }
}