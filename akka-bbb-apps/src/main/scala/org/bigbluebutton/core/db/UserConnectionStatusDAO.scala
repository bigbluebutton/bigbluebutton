package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserConnectionStatusDbModel(
    userId:            String,
    meetingId:         String,
    connectionAliveAt: Option[java.sql.Timestamp]
)

class UserConnectionStatusDbTableDef(tag: Tag) extends Table[UserConnectionStatusDbModel](tag, None, "user_connectionStatus") {
  override def * = (
    userId, meetingId, connectionAliveAt
  ) <> (UserConnectionStatusDbModel.tupled, UserConnectionStatusDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val connectionAliveAt = column[Option[java.sql.Timestamp]]("connectionAliveAt")
}

object UserConnectionStatusdDAO {

  def insert(meetingId: String, userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserConnectionStatusDbTableDef].insertOrUpdate(
        UserConnectionStatusDbModel(
          userId = userId,
          meetingId = meetingId,
          connectionAliveAt = None
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserConnectionStatus table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserConnectionStatus: $e")
      }
  }

}
