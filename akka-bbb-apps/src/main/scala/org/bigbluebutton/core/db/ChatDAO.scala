package org.bigbluebutton.core.db

import PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global
import org.bigbluebutton.core.models.GroupChat

case class ChatDbModel(
    chatId:       String,
    meetingId:    String,
    access:       String,
    createdBy:    String,
    pinnedMessageId: Option[String]
)

class ChatDbTableDef(tag: Tag) extends Table[ChatDbModel](tag, None, "chat") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val access = column[String]("access")
  val createdBy = column[String]("createdBy")
  val pinnedMessageId = column[Option[String]]("pinnedMessageId")
  //  val meeting = foreignKey("chat_meeting_fk", (meetingId), ChatDbTableDef.meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)
  override def * = (chatId, meetingId, access, createdBy, pinnedMessageId) <> (ChatDbModel.tupled, ChatDbModel.unapply)
}

object ChatDAO {
  private val logger = org.slf4j.LoggerFactory.getLogger(this.getClass)

  def insert(meetingId: String, groupChat: GroupChat) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatDbTableDef].insertOrUpdate(
        ChatDbModel(
          chatId = groupChat.id,
          meetingId = meetingId,
          access = groupChat.access,
          createdBy = groupChat.createdBy.id,
          pinnedMessageId = None,
        )
      )
    )

    for {
      user <- groupChat.users
    } yield {
      ChatUserDAO.insert(meetingId, groupChat.id, user, visible = groupChat.createdBy.id == user.id)
    }
  }

  def setPinnedMessage(meetingId: String, chatId: String, messageId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .map(_.pinnedMessageId)
        .update(Some(messageId))
    )
  }

  def clearPinnedMessage(meetingId: String, chatId: String, messageId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.chatId === chatId)
        .filter(_.pinnedMessageId === messageId)
        .map(_.pinnedMessageId)
        .update(None)
    )
  }
}
