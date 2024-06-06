package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

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
    DatabaseConnection.db.run(
      TableQuery[UserReactionDbTableDef].forceInsert(
        UserReactionDbModel(
          meetingId = meetingId,
          userId = userId,
          reactionEmoji = reactionEmoji,
          durationInSeconds = durationInSeconds,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserReaction table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserReaction: $e")
      }
  }

}

