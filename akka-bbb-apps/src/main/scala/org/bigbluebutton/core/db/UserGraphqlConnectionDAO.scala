package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ VoiceUserState }
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success }

case class UserGraphqlConnectionDbModel (
       graphqlConnectionId:     Option[Int],
       sessionToken:            String,
       middlewareUID:           String,
       middlewareConnectionId:  String,
       establishedAt:           java.sql.Timestamp,
       closedAt:                Option[java.sql.Timestamp],
)

class UserGraphqlConnectionDbTableDef(tag: Tag) extends Table[UserGraphqlConnectionDbModel](tag, None, "user_graphqlConnection") {
  override def * = (
    graphqlConnectionId, sessionToken, middlewareUID, middlewareConnectionId, establishedAt, closedAt
  ) <> (UserGraphqlConnectionDbModel.tupled, UserGraphqlConnectionDbModel.unapply)
  val graphqlConnectionId = column[Option[Int]]("graphqlConnectionId", O.PrimaryKey, O.AutoInc)
  val sessionToken = column[String]("sessionToken")
  val middlewareUID = column[String]("middlewareUID")
  val middlewareConnectionId = column[String]("middlewareConnectionId")
  val establishedAt = column[java.sql.Timestamp]("establishedAt")
  val closedAt = column[Option[java.sql.Timestamp]]("closedAt")
}


object UserGraphqlConnectionDAO {
  def insert(sessionToken: String, middlewareUID:String, middlewareConnectionId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserGraphqlConnectionDbTableDef].insertOrUpdate(
        UserGraphqlConnectionDbModel(
          graphqlConnectionId = None,
          sessionToken = sessionToken,
          middlewareUID = middlewareUID,
          middlewareConnectionId = middlewareConnectionId,
          establishedAt = new java.sql.Timestamp(System.currentTimeMillis()),
          closedAt = None
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on user_graphqlConnection table!")
        }
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting user_graphqlConnection: $e")
      }
  }

  def updateClosed(sessionToken: String, middlewareUID: String, middlewareConnectionId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserGraphqlConnectionDbTableDef]
        .filter(_.sessionToken === sessionToken)
        .filter(_.middlewareConnectionId === middlewareConnectionId)
        .filter(_.middlewareUID === middlewareUID)
        .filter(_.closedAt.isEmpty)
        .map(u => u.closedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user_graphqlConnection table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating user_graphqlConnection: $e")
    }
  }


}
