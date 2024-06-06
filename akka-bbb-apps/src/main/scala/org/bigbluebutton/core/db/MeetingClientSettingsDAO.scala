package org.bigbluebutton.core.db

import PostgresProfile.api._
import slick.lifted.ProvenShape
import spray.json.JsValue
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class MeetingClientSettingsDbModel(
    meetingId:              String,
    clientSettingsJson:     JsValue,
)

class MeetingClientSettingsDbTableDef(tag: Tag) extends Table[MeetingClientSettingsDbModel](tag, "meeting_clientSettings") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val clientSettingsJson = column[JsValue]("clientSettingsJson")

  override def * : ProvenShape[MeetingClientSettingsDbModel] = (meetingId, clientSettingsJson) <> (MeetingClientSettingsDbModel.tupled, MeetingClientSettingsDbModel.unapply)
}

object MeetingClientSettingsDAO {
  def insert(meetingId: String, clientSettingsJson: JsValue) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingClientSettingsDbTableDef].forceInsert(
        MeetingClientSettingsDbModel(
          meetingId = meetingId,
          clientSettingsJson = clientSettingsJson
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in MeetingClientSettings table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting MeetingClientSettings: $e")
      }
  }

}