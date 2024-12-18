package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.UserLockSettings
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

case class UserLockSettingsDbModel(
    meetingId:              String,
    userId:                 String,
    disablePublicChat:      Boolean,
)

class UserLockSettingsDbTableDef(tag: Tag) extends Table[UserLockSettingsDbModel](tag, "user_lockSettings") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val disablePublicChat = column[Boolean]("disablePublicChat")

  override def * : ProvenShape[UserLockSettingsDbModel] = (meetingId, userId, disablePublicChat) <> (UserLockSettingsDbModel.tupled, UserLockSettingsDbModel.unapply)
}

object UserLockSettingsDAO {
  def insertOrUpdate(meetingId: String, userId: String, userLockSettings: UserLockSettings) = {
    DatabaseConnection.enqueue(
      TableQuery[UserLockSettingsDbTableDef].insertOrUpdate(
        UserLockSettingsDbModel(
          meetingId = meetingId,
          userId = userId,
          disablePublicChat = userLockSettings.disablePublicChat,
        ),
      )
    )
  }

}