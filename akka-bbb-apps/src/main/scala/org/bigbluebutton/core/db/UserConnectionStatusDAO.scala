package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserConnectionStatusDbModel(
    userId:               String,
    meetingId:            String,
    connectionAliveAt:    Option[java.sql.Timestamp],
    userClientResponseAt: Option[java.sql.Timestamp],
    networkRttInMs:       Option[Double]
)

class UserConnectionStatusDbTableDef(tag: Tag) extends Table[UserConnectionStatusDbModel](tag, None, "user_connectionStatus") {
  override def * = (
    userId, meetingId, connectionAliveAt, userClientResponseAt, networkRttInMs
  ) <> (UserConnectionStatusDbModel.tupled, UserConnectionStatusDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val connectionAliveAt = column[Option[java.sql.Timestamp]]("connectionAliveAt")
  val userClientResponseAt = column[Option[java.sql.Timestamp]]("userClientResponseAt")
  val networkRttInMs = column[Option[Double]]("networkRttInMs")
}

object UserConnectionStatusDAO {

  def insert(meetingId: String, userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserConnectionStatusDbTableDef].insertOrUpdate(
        UserConnectionStatusDbModel(
          userId = userId,
          meetingId = meetingId,
          connectionAliveAt = None,
          userClientResponseAt = None,
          networkRttInMs = None
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserConnectionStatus table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserConnectionStatus: $e")
      }
  }

  def updateUserAlive(userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserConnectionStatusDbTableDef]
        .filter(_.userId === userId)
        .map(t => (t.connectionAliveAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated connectionAliveAt on UserConnectionStatus table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating connectionAliveAt on UserConnectionStatus: $e")
      }
  }

  def updateUserRtt(userId: String, networkRttInMs: Double) = {
    DatabaseConnection.db.run(
      TableQuery[UserConnectionStatusDbTableDef]
        .filter(_.userId === userId)
        .map(t => (t.networkRttInMs, t.userClientResponseAt))
        .update((Some(networkRttInMs), Some(new java.sql.Timestamp(System.currentTimeMillis()))))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated networkRttInMs on UserConnectionStatus table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating networkRttInMs on UserConnectionStatus: $e")
      }
  }

}
