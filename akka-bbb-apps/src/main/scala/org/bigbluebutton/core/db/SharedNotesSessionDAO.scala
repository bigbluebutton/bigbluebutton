package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

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
    DatabaseConnection.enqueue(
      TableQuery[SharedNotesSessionDbTableDef].insertOrUpdate(
        SharedNotesSessionDbModel(
          meetingId = meetingId,
          sharedNotesExtId = sharedNotesExtId,
          userId = userId,
          sessionId = sessionId
        )
      )
    )
  }

  def delete(meetingId: String, userId: String, sessionId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[SharedNotesSessionDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .filter(_.sessionId === sessionId)
        .delete
    )
  }
}