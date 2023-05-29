package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserLocalSettingsDbModel(
    userId:       String,
    meetingId:    String,
//    settingsJson: String
)

class UserLocalSettingsDbTableDef(tag: Tag) extends Table[UserLocalSettingsDbModel](tag, "user_localSettings") {
  val userId = column[String]("userId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
//  val settingsJson = column[String]("settingsJson")

  override def * : ProvenShape[UserLocalSettingsDbModel] = (userId, meetingId) <> (UserLocalSettingsDbModel.tupled, UserLocalSettingsDbModel.unapply)
}

object UserLocalSettingsDAO {
  def insert(userId: String, meetingId: String) = {
    DatabaseConnection.db.run(
        TableQuery[UserLocalSettingsDbTableDef].insertOrUpdate(
          UserLocalSettingsDbModel(
            userId = userId,
            meetingId = meetingId
//            settingsJson = parameter._2
          )
        )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserLocalSettings table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserLocalSettings: $e")
    }
  }
}