package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.{GroupChatFactory, GroupChatMessage}

case class ChatMessageDbModel(
    messageId:          String,
    chatId:             String,
    meetingId:          String,
    correlationId:      String,
    createdAt:          java.sql.Timestamp,
    chatEmphasizedText: Boolean,
    message:            String,
    messageType:        String,
    replyToMessageId:   Option[String],
    messageMetadata:    Option[String],
    senderId:           Option[String],
    senderName:         String,
    senderRole:         Option[String]
)

class ChatMessageDbTableDef(tag: Tag) extends Table[ChatMessageDbModel](tag, None, "chat_message") {
  val messageId = column[String]("messageId", O.PrimaryKey)
  val chatId = column[String]("chatId")
  val meetingId = column[String]("meetingId")
  val correlationId = column[String]("correlationId")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val chatEmphasizedText = column[Boolean]("chatEmphasizedText")
  val message = column[String]("message")
  val messageType = column[String]("messageType")
  val replyToMessageId = column[Option[String]]("replyToMessageId")
  val messageMetadata = column[Option[String]]("messageMetadata")
  val senderId = column[Option[String]]("senderId")
  val senderName = column[String]("senderName")
  val senderRole = column[Option[String]]("senderRole")
  //  val chat = foreignKey("chat_message_chat_fk", (chatId, meetingId), ChatTable.chats)(c => (c.chatId, c.meetingId), onDelete = ForeignKeyAction.Cascade)
  //  val sender = foreignKey("chat_message_sender_fk", senderId, UserTable.users)(_.userId, onDelete = ForeignKeyAction.SetNull)

  override def * = (messageId, chatId, meetingId, correlationId, createdAt, chatEmphasizedText, message, messageType, replyToMessageId, messageMetadata, senderId, senderName, senderRole) <> (ChatMessageDbModel.tupled, ChatMessageDbModel.unapply)
}

object ChatMessageDAO {
  def insert(meetingId: String, chatId: String, groupChatMessage: GroupChatMessage, messageType: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageDbTableDef].insertOrUpdate(
        ChatMessageDbModel(
          messageId = groupChatMessage.id,
          chatId = chatId,
          meetingId = meetingId,
          correlationId = groupChatMessage.correlationId,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis()),
          chatEmphasizedText = groupChatMessage.chatEmphasizedText,
          message = groupChatMessage.message,
          messageType = messageType,
          replyToMessageId = groupChatMessage.replyToMessageId match {
            case "" => None
            case messageId => Some(messageId)
          },
          messageMetadata = Some(JsonUtils.mapToJson(groupChatMessage.metadata).compactPrint),
          senderId = Some(groupChatMessage.sender.id),
          senderName = groupChatMessage.sender.name,
          senderRole = Some(groupChatMessage.sender.role),
        )
      )
    )

    //Set chat visible for all participant users
    ChatUserDAO.updateChatVisible(meetingId, chatId, visible = true)
  }

//  def insert(meetingId: String, chatId: String, groupChatMessage: GroupChatMessage): Unit = {
//    val chatMessage = ChatMessageDbModel(
//      messageId = groupChatMessage.id,
//      chatId = chatId,
//      meetingId = meetingId,
//      correlationId = groupChatMessage.correlationId,
//      createdAt = new java.sql.Timestamp(System.currentTimeMillis()),
//      chatEmphasizedText = groupChatMessage.chatEmphasizedText,
//      message = groupChatMessage.message,
//      messageType = "default",
//      messageMetadata = None,
//      senderId = Some(groupChatMessage.sender.id),
//      senderName = groupChatMessage.sender.name,
//      senderRole = Some(groupChatMessage.sender.role),
//    )
//
//    val insertAction = TableQuery[ChatMessageDbTableDef].insertOrUpdate(chatMessage)
//    DatabaseConnection.enqueue(insertAction)
//  }

  def insertSystemMsg(meetingId: String, chatId: String, message: String, messageType: String, messageMetadata: Map[String,Any], senderName: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageDbTableDef].insertOrUpdate(
        ChatMessageDbModel(
          messageId = GroupChatFactory.genId(),
          chatId = chatId,
          meetingId = meetingId,
          correlationId = "",
          createdAt = new java.sql.Timestamp(System.currentTimeMillis()),
          chatEmphasizedText = false,
          message = message,
          messageType = messageType,
          replyToMessageId = None,
          messageMetadata = Some(JsonUtils.mapToJson(messageMetadata).compactPrint),
          senderId = None,
          senderName = senderName,
          senderRole = None
        )
      )
    )

    //Set chat visible for all participant users
    ChatUserDAO.updateChatVisible(meetingId, chatId, visible = true)
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