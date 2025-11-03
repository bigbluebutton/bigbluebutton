package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

case class ChatMessageReactionDbModel(
    meetingId:     String,
    messageId:     String,
    userId:        String,
    reactionEmoji: String,
    createdAt:     java.sql.Timestamp
)

class ChatMessageReactionDbTableDef(tag: Tag) extends Table[ChatMessageReactionDbModel](tag, "chat_message_reaction") {
  val meetingId = column[String]("meetingId")
  val messageId = column[String]("messageId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val reactionEmoji = column[String]("reactionEmoji", O.PrimaryKey)
  val createdAt = column[java.sql.Timestamp]("createdAt")

  override def * : ProvenShape[ChatMessageReactionDbModel] = (meetingId, messageId, userId, reactionEmoji, createdAt) <> (ChatMessageReactionDbModel.tupled, ChatMessageReactionDbModel.unapply)
}

object ChatMessageReactionDAO {
  def insert(meetingId: String, messageId: String, userId: String, reactionEmoji: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageReactionDbTableDef].forceInsert(
        ChatMessageReactionDbModel(
          meetingId = meetingId,
          messageId = messageId,
          userId = userId,
          reactionEmoji = reactionEmoji,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    )
  }

  def delete(meetingId: String, messageId: String, userId: String, reactionEmoji: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ChatMessageReactionDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.messageId === messageId)
        .filter(_.userId === userId)
        .filter(_.reactionEmoji === reactionEmoji)
        .delete
    )
  }

}

