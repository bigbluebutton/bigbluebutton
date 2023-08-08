package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserReactionDbModel(
    userId:        String,
    reactionEmoji: String,
    duration:      Int,
    createdAt:     java.sql.Timestamp
)

class UserReactionDbTableDef(tag: Tag) extends Table[UserReactionDbModel](tag, "user_reaction") {
  val userId = column[String]("userId")
  val reactionEmoji = column[String]("reactionEmoji")
  val duration = column[Int]("duration")
  val createdAt = column[java.sql.Timestamp]("createdAt")

  override def * : ProvenShape[UserReactionDbModel] = (userId, reactionEmoji, duration, createdAt) <> (UserReactionDbModel.tupled, UserReactionDbModel.unapply)
}

object UserReactionDAO {
  def insert(userId: String, reactionEmoji: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserReactionDbTableDef].forceInsert(
        UserReactionDbModel(
          userId = userId,
          reactionEmoji = reactionEmoji,
          duration = 60,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserReaction table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserReaction: $e")
      }
  }

}

