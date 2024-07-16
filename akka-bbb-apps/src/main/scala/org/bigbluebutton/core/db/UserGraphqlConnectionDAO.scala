package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

case class UserGraphqlConnectionDbModel (
       graphqlConnectionId:     Option[Int],
       sessionToken:            String,
       clientSessionUUID:       String,
       clientType:              String,
       clientIsMobile:          Boolean,
       middlewareUID:           String,
       middlewareConnectionId:  String,
       establishedAt:           java.sql.Timestamp,
       closedAt:                Option[java.sql.Timestamp],
)

class UserGraphqlConnectionDbTableDef(tag: Tag) extends Table[UserGraphqlConnectionDbModel](tag, None, "user_graphqlConnection") {
  override def * = (
    graphqlConnectionId, sessionToken, clientSessionUUID, clientType, clientIsMobile, middlewareUID, middlewareConnectionId, establishedAt, closedAt
  ) <> (UserGraphqlConnectionDbModel.tupled, UserGraphqlConnectionDbModel.unapply)
  val graphqlConnectionId = column[Option[Int]]("graphqlConnectionId", O.PrimaryKey, O.AutoInc)
  val sessionToken = column[String]("sessionToken")
  val clientSessionUUID = column[String]("clientSessionUUID")
  val clientType = column[String]("clientType")
  val clientIsMobile = column[Boolean]("clientIsMobile")
  val middlewareUID = column[String]("middlewareUID")
  val middlewareConnectionId = column[String]("middlewareConnectionId")
  val establishedAt = column[java.sql.Timestamp]("establishedAt")
  val closedAt = column[Option[java.sql.Timestamp]]("closedAt")
}


object UserGraphqlConnectionDAO {
  def insert(sessionToken: String,
             clientSessionUUID: String,
             clientType: String,
             clientIsMobile: Boolean,
             middlewareUID:String,
             middlewareConnectionId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserGraphqlConnectionDbTableDef].insertOrUpdate(
        UserGraphqlConnectionDbModel(
          graphqlConnectionId = None,
          sessionToken = sessionToken,
          clientSessionUUID = clientSessionUUID,
          clientType = clientType,
          clientIsMobile = clientIsMobile,
          middlewareUID = middlewareUID,
          middlewareConnectionId = middlewareConnectionId,
          establishedAt = new java.sql.Timestamp(System.currentTimeMillis()),
          closedAt = None
        )
      )
    )
  }

  def updateClosed(sessionToken: String, middlewareUID: String, middlewareConnectionId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserGraphqlConnectionDbTableDef]
        .filter(_.sessionToken === sessionToken)
        .filter(_.middlewareConnectionId === middlewareConnectionId)
        .filter(_.middlewareUID === middlewareUID)
        .filter(_.closedAt.isEmpty)
        .map(u => u.closedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }


}
