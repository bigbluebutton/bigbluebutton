package org.bigbluebutton.core.db

import PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global
import org.bigbluebutton.core.models.GroupChat

case class ChatDbModel(
    chatId:       String,
    meetingId:    String,
    access:       String,
    createdBy:    String,
    totalMessages: Int,
    pinnedMessageIds: Option[List[String]]
)

class ChatDbTableDef(tag: Tag) extends Table[ChatDbModel](tag, None, "chat") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val access = column[String]("access")
  val createdBy = column[String]("createdBy")
  val totalMessages = column[Int]("totalMessages")
  val pinnedMessageIds = column[Option[List[String]]]("pinnedMessageIds")
  //  val meeting = foreignKey("chat_meeting_fk", (meetingId), ChatDbTableDef.meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)
  override def * = (chatId, meetingId, access, createdBy, totalMessages, pinnedMessageIds) <> (ChatDbModel.tupled, ChatDbModel.unapply)
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
          totalMessages = 0,
          pinnedMessageIds = None,
        )
      )
    )

    for {
      user <- groupChat.users
    } yield {
      ChatUserDAO.insert(meetingId, groupChat.id, user, visible = groupChat.createdBy.id == user.id)
    }
  }

  def addPinnedMessage(meetingId: String, chatId: String, messageId: String) = {
    DatabaseConnection.enqueue(
      (
        TableQuery[ChatDbTableDef]
          .filter(_.meetingId === meetingId)
          .filter(_.chatId === chatId)
          .result
          .headOption
          .flatMap {
            case Some(chatRow) =>
              val current = chatRow.pinnedMessageIds.getOrElse(List.empty[String])
              if (current.contains(messageId)) DBIO.successful(Some(chatRow))
              else for {
                _       <- TableQuery[ChatDbTableDef].filter(_.meetingId === meetingId).filter(_.chatId === chatId).map(_.pinnedMessageIds).update(Some(current :+ messageId))
                updated <- TableQuery[ChatDbTableDef].filter(_.meetingId === meetingId).filter(_.chatId === chatId).result.headOption
              } yield updated
            case None => DBIO.successful(None)
          }
      ).transactionally
        .map { maybeRow =>
          logger.info(s"addPinnedMessage result for meetingId=$meetingId chatId=$chatId pinnedMessageIds=${maybeRow.flatMap(_.pinnedMessageIds)}")
          0
        }
    )
  }

  def removePinnedMessage(meetingId: String, chatId: String, messageId: String) = {
    DatabaseConnection.enqueue(
      (
        TableQuery[ChatDbTableDef]
          .filter(_.meetingId === meetingId)
          .filter(_.chatId === chatId)
          .result
          .headOption
          .flatMap {
            case Some(chatRow) =>
              val current = chatRow.pinnedMessageIds.getOrElse(List.empty[String])
              val updated = current.filterNot(_ == messageId)
              for {
                _          <- TableQuery[ChatDbTableDef].filter(_.meetingId === meetingId).filter(_.chatId === chatId).map(_.pinnedMessageIds).update(Some(updated))
                updatedRow <- TableQuery[ChatDbTableDef].filter(_.meetingId === meetingId).filter(_.chatId === chatId).result.headOption
              } yield updatedRow
            case None => DBIO.successful(None)
          }
      ).transactionally
        .map { maybeRow =>
          logger.info(s"removePinnedMessage result for meetingId=$meetingId chatId=$chatId pinnedMessageIds=${maybeRow.flatMap(_.pinnedMessageIds)}")
          0
        }
    )
  }
}
