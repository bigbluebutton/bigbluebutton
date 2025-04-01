package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.{GroupChatFactory, GroupChatMessage}

case class ChatMessageDbModel(
    messageId:          String,
    chatId:             String,
    meetingId:          String,
    correlationId:      String,
    chatEmphasizedText: Boolean,
    message:            Option[String],
    messageType:        String,
    replyToMessageId:   Option[String],
    messageMetadata:    Option[String],
    senderId:           Option[String],
    senderName:         String,
    senderRole:         Option[String],
    createdAt:          java.sql.Timestamp,
    editedAt:           Option[java.sql.Timestamp],
    deletedByUserId:    Option[String],
    deletedAt:          Option[java.sql.Timestamp]
)

class ChatMessageDbTableDef(tag: Tag) extends Table[ChatMessageDbModel](tag, None, "chat_message") {
  val messageId = column[String]("messageId", O.PrimaryKey)
  val chatId = column[String]("chatId")
  val meetingId = column[String]("meetingId")
  val correlationId = column[String]("correlationId")
  val chatEmphasizedText = column[Boolean]("chatEmphasizedText")
  val message = column[Option[String]]("message")
  val messageType = column[String]("messageType")
  val replyToMessageId = column[Option[String]]("replyToMessageId")
  val messageMetadata = column[Option[String]]("messageMetadata")
  val senderId = column[Option[String]]("senderId")
  val senderName = column[String]("senderName")
  val senderRole = column[Option[String]]("senderRole")
  //  val chat = foreignKey("chat_message_chat_fk", (chatId, meetingId), ChatTable.chats)(c => (c.chatId, c.meetingId), onDelete = ForeignKeyAction.Cascade)
  //  val sender = foreignKey("chat_message_sender_fk", senderId, UserTable.users)(_.userId, onDelete = ForeignKeyAction.SetNull)
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val editedAt = column[Option[java.sql.Timestamp]]("editedAt")
  val deletedByUserId = column[Option[String]]("deletedByUserId")
  val deletedAt = column[Option[java.sql.Timestamp]]("deletedAt")

  override def * = (
    messageId, chatId, meetingId, correlationId, chatEmphasizedText,
    message, messageType, replyToMessageId, messageMetadata, senderId, senderName, senderRole,
    createdAt, editedAt, deletedByUserId, deletedAt
  ) <> (ChatMessageDbModel.tupled, ChatMessageDbModel.unapply)
}

object ChatMessageDAO {
  def insert(meetingId: String, chatId: String, groupChatMessage: GroupChatMessage, messageType: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageDbTableDef].forceInsert(
        ChatMessageDbModel(
          messageId = groupChatMessage.id,
          chatId = chatId,
          meetingId = meetingId,
          correlationId = groupChatMessage.correlationId,
          chatEmphasizedText = groupChatMessage.chatEmphasizedText,
          message = Some(groupChatMessage.message),
          messageType = messageType,
          replyToMessageId = groupChatMessage.replyToMessageId match {
            case "" => None
            case messageId => Some(messageId)
          },
          messageMetadata = Some(JsonUtils.mapToJson(groupChatMessage.metadata).compactPrint),
          senderId = Some(groupChatMessage.sender.id),
          senderName = groupChatMessage.sender.name,
          senderRole = Some(groupChatMessage.sender.role),
          createdAt = new java.sql.Timestamp(System.currentTimeMillis()),
          editedAt = None,
          deletedByUserId = None,
          deletedAt = None,
        )
      )
    )

    //Set chat visible for all participant users
    ChatUserDAO.updateChatVisible(meetingId, chatId, visible = true)
  }

  def insertSystemMsg(meetingId: String, chatId: String, message: String, messageType: String, messageMetadata: Map[String,Any], senderName: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageDbTableDef].forceInsert(
        ChatMessageDbModel(
          messageId = GroupChatFactory.genId(),
          chatId = chatId,
          meetingId = meetingId,
          correlationId = "",
          chatEmphasizedText = false,
          message = Some(message),
          messageType = messageType,
          replyToMessageId = None,
          messageMetadata = Some(JsonUtils.mapToJson(messageMetadata).compactPrint),
          senderId = None,
          senderName = senderName,
          senderRole = None,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis()),
          editedAt = None,
          deletedByUserId = None,
          deletedAt = None,
        )
      )
    )

    //Set chat visible for all participant users
    ChatUserDAO.updateChatVisible(meetingId, chatId, visible = true)
  }

  def update(meetingId: String, chatId: String, messageId: String, message: String) = {
    //The database will automatically keep the previous message as history
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .filter(_.messageId === messageId)
        .filter(_.message.nonEmpty)
        .map(msg => (msg.message, msg.editedAt))
        .update((Some(message), Some(new java.sql.Timestamp(System.currentTimeMillis()))))
    )
  }

  def softDelete(meetingId: String, chatId: String, messageId: String, deletedByUserId: String) = {
    //set message=NULL instead of delete it from db, because the client will show "Message deleted"
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .filter(_.messageId === messageId)
        .filter(_.message.nonEmpty)
        .map(msg => (msg.message, msg.deletedByUserId, msg.deletedAt))
        .update((None, Some(deletedByUserId), Some(new java.sql.Timestamp(System.currentTimeMillis()))))
    )
  }

  def deleteAllFromChat(meetingId: String, chatId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .delete
    )
  }

}