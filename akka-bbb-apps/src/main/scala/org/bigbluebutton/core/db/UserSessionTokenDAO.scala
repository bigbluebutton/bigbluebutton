package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

case class UserSessionTokenDbModel (
                                     meetingId:               String,
                                     userId:                  String,
                                     sessionToken:            String,
                                     createdAt:               java.sql.Timestamp,
                                     removedAt:               Option[java.sql.Timestamp],
                                   )

class UserSessionTokenDbTableDef(tag: Tag) extends Table[UserSessionTokenDbModel](tag, None, "user_sessionToken") {
  override def * = (
    meetingId, userId, sessionToken, createdAt, removedAt
  ) <> (UserSessionTokenDbModel.tupled, UserSessionTokenDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val sessionToken = column[String]("sessionToken", O.PrimaryKey)
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val removedAt = column[Option[java.sql.Timestamp]]("removedAt")
}

object UserSessionTokenDAO {
  def insert(meetingId: String, userId: String, sessionToken: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserSessionTokenDbTableDef].insertOrUpdate(
        UserSessionTokenDbModel(
          meetingId = meetingId,
          userId = userId,
          sessionToken = sessionToken,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis()),
          removedAt = None
        )
      )
    )
  }

  def softDelete(meetingId: String, userId: String, sessionTokenToRemove: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserSessionTokenDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .filter(_.sessionToken === sessionTokenToRemove)
        .filter(_.removedAt.isEmpty)
        .map(u => u.removedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }


}