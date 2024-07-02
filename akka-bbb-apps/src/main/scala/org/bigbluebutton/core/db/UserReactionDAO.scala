package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

case class UserReactionDbModel(
    meetingId:         String,
    userId:            String,
    reactionEmoji:     String,
    durationInSeconds: Int,
    createdAt:         java.sql.Timestamp
)

class UserReactionDbTableDef(tag: Tag) extends Table[UserReactionDbModel](tag, "user_reaction") {
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val reactionEmoji = column[String]("reactionEmoji")
  val durationInSeconds = column[Int]("durationInSeconds")
  val createdAt = column[java.sql.Timestamp]("createdAt")

  override def * : ProvenShape[UserReactionDbModel] = (meetingId, userId, reactionEmoji, durationInSeconds, createdAt) <> (UserReactionDbModel.tupled, UserReactionDbModel.unapply)
}

object UserReactionDAO {
  def insert(meetingId: String, userId: String, reactionEmoji: String, durationInSeconds: Int) = {
    DatabaseConnection.enqueue(
      TableQuery[UserReactionDbTableDef].forceInsert(
        UserReactionDbModel(
          meetingId = meetingId,
          userId = userId,
          reactionEmoji = reactionEmoji,
          durationInSeconds = durationInSeconds,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    )
  }

}

