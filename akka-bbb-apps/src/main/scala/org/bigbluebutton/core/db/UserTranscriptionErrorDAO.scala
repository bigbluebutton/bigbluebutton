package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

case class UserTranscriptionErrorDbModel(
    meetingId:     String,
    userId:        String,
    errorCode:     String,
    errorMessage:  String,
    lastUpdatedAt: java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class UserTranscriptionErrorDbTableDef(tag: Tag) extends Table[UserTranscriptionErrorDbModel](tag, None, "user_transcriptionError") {
  override def * = (
    meetingId, userId, errorCode, errorMessage, lastUpdatedAt
  ) <> (UserTranscriptionErrorDbModel.tupled, UserTranscriptionErrorDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val errorCode = column[String]("errorCode")
  val errorMessage = column[String]("errorMessage")
  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
}

object UserTranscriptionErrorDAO {
  def insert(userId: String, meetingId: String, errorCode: String, errorMessage: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserTranscriptionErrorDbTableDef].insertOrUpdate(
        UserTranscriptionErrorDbModel(
          meetingId = meetingId,
          userId = userId,
          errorCode = errorCode,
          errorMessage = errorMessage,
          lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis()),
        )
      )
    )
  }

}
