package org.bigbluebutton.core.db

import PostgresProfile.api._
import slick.lifted.ProvenShape
import spray.json.JsValue
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserClientSettingsDbModel(
    userId:                 String,
    meetingId:              String,
    userClientSettingsJson: JsValue
)

class UserClientSettingsDbTableDef(tag: Tag) extends Table[UserClientSettingsDbModel](tag, "user_clientSettings") {
  val userId = column[String]("userId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userClientSettingsJson = column[JsValue]("userClientSettingsJson")

  override def * : ProvenShape[UserClientSettingsDbModel] = (userId, meetingId, userClientSettingsJson) <> (UserClientSettingsDbModel.tupled, UserClientSettingsDbModel.unapply)
}

object UserClientSettingsDAO {
  def insert(userId: String, meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserClientSettingsDbTableDef].insertOrUpdate(
        UserClientSettingsDbModel(
          userId = userId,
          meetingId = meetingId,
          userClientSettingsJson = JsonUtils.stringToJson("{}")
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserClientSettings table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserClientSettings: $e")
      }
  }
}