package org.bigbluebutton.core.db

import PostgresProfile.api._
import slick.lifted.ProvenShape
import spray.json.JsValue

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
  def insertOrUpdate(meetingId: String, userId: String, userClientSettingsJson: JsValue) = {
    DatabaseConnection.enqueue(
      TableQuery[UserClientSettingsDbTableDef].insertOrUpdate(
        UserClientSettingsDbModel(
          userId = userId,
          meetingId = meetingId,
          userClientSettingsJson = userClientSettingsJson
        )
      )
    )
  }
}