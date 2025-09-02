package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._

case class UserConnectionStatusDbModel(
    meetingId:          String,
    userId:             String,
    sessionToken:       String,
    clientSessionUUID:  String,
    connectionAliveAt:  Option[java.sql.Timestamp],
    networkRttInMs:     Option[Double],
    applicationRttInMs: Option[Double],
    traceLog:           Option[String],
    status:             String,

)

class UserConnectionStatusDbTableDef(tag: Tag) extends Table[UserConnectionStatusDbModel](tag, None, "user_connectionStatus") {
  override def * = (
    meetingId, userId, sessionToken, clientSessionUUID, connectionAliveAt, networkRttInMs, applicationRttInMs, traceLog, status
  ) <> (UserConnectionStatusDbModel.tupled, UserConnectionStatusDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val sessionToken = column[String]("sessionToken", O.PrimaryKey)
  val clientSessionUUID = column[String]("clientSessionUUID", O.PrimaryKey)
  val connectionAliveAt = column[Option[java.sql.Timestamp]]("connectionAliveAt")
  val networkRttInMs = column[Option[Double]]("networkRttInMs")
  val applicationRttInMs = column[Option[Double]]("applicationRttInMs")
  val traceLog = column[Option[String]]("traceLog")
  val status = column[String]("status")
}

object UserConnectionStatusDAO {

  def insert(meetingId: String, userId: String, sessionToken: String, clientSessionUUID: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserConnectionStatusDbTableDef].insertOrUpdate(
        UserConnectionStatusDbModel(
          meetingId = meetingId,
          userId = userId,
          sessionToken = sessionToken,
          clientSessionUUID = clientSessionUUID,
          connectionAliveAt = None,
          networkRttInMs = None,
          applicationRttInMs = None,
          traceLog = None,
          status = "normal"
        )
      )
    )
  }

  def updateUserAlive(meetingId: String, userId: String, sessionToken: String, clientSessionUUID: String, rtt: Double, appRtt: Double, traceLog: String, status: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserConnectionStatusDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .filter(_.sessionToken === sessionToken)
        .filter(_.clientSessionUUID === clientSessionUUID)
        .map(t => (t.connectionAliveAt, t.networkRttInMs, t.applicationRttInMs, t.traceLog, t.status))
        .update(
          (
            Some(new java.sql.Timestamp(System.currentTimeMillis())),
            rtt match {
              case 0                => None
              case someRtt: Double  => Some(someRtt)
            },
            appRtt match {
              case 0                => None
              case someRtt: Double  => Some(someRtt)
            },
            traceLog match {
              case ""             => None
              case log: String => Some(log)
            },
            status,
          )
        )
    )
  }

}
