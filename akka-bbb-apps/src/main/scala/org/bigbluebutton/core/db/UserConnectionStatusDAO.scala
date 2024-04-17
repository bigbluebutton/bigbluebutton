package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserConnectionStatusDbModel(
    userId:            String,
    meetingId:         String,
    connectionAliveAt: Option[java.sql.Timestamp],
    networkRttInMs:    Option[Double],
    status:            String,
    statusUpdatedAt:   Option[java.sql.Timestamp]
)

class UserConnectionStatusDbTableDef(tag: Tag) extends Table[UserConnectionStatusDbModel](tag, None, "user_connectionStatus") {
  override def * = (
    userId, meetingId, connectionAliveAt, networkRttInMs, status, statusUpdatedAt
  ) <> (UserConnectionStatusDbModel.tupled, UserConnectionStatusDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val connectionAliveAt = column[Option[java.sql.Timestamp]]("connectionAliveAt")
  val networkRttInMs = column[Option[Double]]("networkRttInMs")
  val status = column[String]("status")
  val statusUpdatedAt = column[Option[java.sql.Timestamp]]("statusUpdatedAt")
}

object UserConnectionStatusDAO {

  def insert(meetingId: String, userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserConnectionStatusDbTableDef].insertOrUpdate(
        UserConnectionStatusDbModel(
          userId = userId,
          meetingId = meetingId,
          connectionAliveAt = None,
          networkRttInMs = None,
          status = "normal",
          statusUpdatedAt = None
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserConnectionStatus table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserConnectionStatus: $e")
      }
  }

  def updateUserAlive(meetingId: String, userId: String, rtt: Option[Double], status: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserConnectionStatusDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(t => (t.connectionAliveAt, t.networkRttInMs, t.status, t.statusUpdatedAt))
        .update(
          (
            Some(new java.sql.Timestamp(System.currentTimeMillis())),
            rtt,
            status,
            Some(new java.sql.Timestamp(System.currentTimeMillis())),
          )
        )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated connectionAliveAt on UserConnectionStatus table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating connectionAliveAt on UserConnectionStatus: $e")
      }
  }

}
