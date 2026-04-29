package org.bigbluebutton.core.db

import PostgresProfile.api._
import org.bigbluebutton.core.models.GroupChat

case class ChatDbModel(
    chatId:          String,
    meetingId:       String,
    access:          String,
    createdBy:       String,
    pinnedMessageId: Option[String],
    pinnedByUserId:  Option[String],
    pinnedAt:        Option[java.sql.Timestamp]
)

class ChatDbTableDef(tag: Tag) extends Table[ChatDbModel](tag, None, "chat") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val access = column[String]("access")
  val createdBy = column[String]("createdBy")
  val pinnedMessageId = column[Option[String]]("pinnedMessageId")
  val pinnedByUserId = column[Option[String]]("pinnedByUserId")
  val pinnedAt = column[Option[java.sql.Timestamp]]("pinnedAt")
  //  val meeting = foreignKey("chat_meeting_fk", (meetingId), ChatDbTableDef.meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)
  override def * = (chatId, meetingId, access, createdBy, pinnedMessageId, pinnedByUserId, pinnedAt) <> (ChatDbModel.tupled, ChatDbModel.unapply)
}

object ChatDAO {
  def insert(meetingId: String, groupChat: GroupChat) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatDbTableDef].insertOrUpdate(
        ChatDbModel(
          chatId = groupChat.id,
          meetingId = meetingId,
          access = groupChat.access,
          createdBy = groupChat.createdBy.id,
          pinnedMessageId = None,
          pinnedByUserId = None,
          pinnedAt = None,
        )
      )
    )

    for {
      user <- groupChat.users
    } yield {
      ChatUserDAO.insert(meetingId, groupChat.id, user, visible = groupChat.createdBy.id == user.id)
    }
  }

  def setPinnedMessage(meetingId: String, chatId: String, messageId: String, pinnedByUserId: String) = {
    val now = new java.sql.Timestamp(System.currentTimeMillis())
    DatabaseConnection.enqueue(
      TableQuery[ChatDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .map(c => (c.pinnedMessageId, c.pinnedByUserId, c.pinnedAt))
        .update((Some(messageId), Some(pinnedByUserId), Some(now)))
    )
  }

  def clearPinnedMessage(meetingId: String, chatId: String, messageId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .filter(_.pinnedMessageId === messageId)
        .map(c => (c.pinnedMessageId, c.pinnedByUserId, c.pinnedAt))
        .update((None, None, None))
    )
  }
}
