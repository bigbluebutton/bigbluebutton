package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class SharedNotesSessionDbModel(
    meetingId:        String,
    sharedNotesExtId: String,
    userId:           String,
    sessionId:        String
)

class SharedNotesSessionDbTableDef(tag: Tag) extends Table[SharedNotesSessionDbModel](tag, None, "sharedNotes_session") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val sharedNotesExtId = column[String]("sharedNotesExtId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val sessionId = column[String]("sessionId")
  val * = (meetingId, sharedNotesExtId, userId, sessionId) <> (SharedNotesSessionDbModel.tupled, SharedNotesSessionDbModel.unapply)
}

object SharedNotesSessionDAO {
  def insert(meetingId: String, sharedNotesExtId: String, userId: String, sessionId: String) = {
    DatabaseConnection.db.run(
      TableQuery[SharedNotesSessionDbTableDef].insertOrUpdate(
        SharedNotesSessionDbModel(
          meetingId = meetingId,
          sharedNotesExtId = sharedNotesExtId,
          userId = userId,
          sessionId = sessionId
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on SharedNotesSession table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting SharedNotesSession: $e")
      }
  }

  def delete(meetingId: String, userId: String, sessionId: String) = {
    DatabaseConnection.db.run(
      TableQuery[SharedNotesSessionDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .filter(_.sessionId === sessionId)
        .delete
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"SharedNotesSession ${sessionId} deleted")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error deleting SharedNotesSession ${sessionId}: $e")
      }
  }
}