package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserLivekitDbModel(
    meetingId:         String,
    userId:            String,
    livekitToken:      String,
)

class UserLivekitDbTableDef(tag: Tag) extends Table[UserLivekitDbModel](tag, "user_livekit") {
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val livekitToken = column[String]("livekitToken")

  override def * : ProvenShape[UserLivekitDbModel] = (
    meetingId,
    userId,
    livekitToken
  ) <> (UserLivekitDbModel.tupled, UserLivekitDbModel.unapply)
}

object UserLivekitDAO {
  def insert(meetingId: String, userId: String, livekitToken: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserLivekitDbTableDef].forceInsert(
        UserLivekitDbModel(
          meetingId = meetingId,
          userId = userId,
          livekitToken = livekitToken
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.info(s"$rowsAffected row(s) inserted on UserLivekit table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserLivekit: $e")
      }
  }
}
