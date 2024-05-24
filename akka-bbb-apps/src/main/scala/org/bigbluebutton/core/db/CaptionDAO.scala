package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class CaptionDbModel(
    captionId:   String,
    meetingId:   String,
    captionType: String,
    userId:      String,
    locale:      String,
    captionText: String,
    createdAt:   java.sql.Timestamp
)

class CaptionTableDef(tag: Tag) extends Table[CaptionDbModel](tag, None, "caption") {
  val captionId = column[String]("captionId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val captionType = column[String]("captionType")
  val userId = column[String]("userId")
  val locale = column[String]("locale")
  val captionText = column[String]("captionText")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  def * = (captionId, meetingId, captionType, userId, locale, captionText, createdAt) <> (CaptionDbModel.tupled, CaptionDbModel.unapply)
}

object CaptionTypes {
  val AUDIO_TRANSCRIPTION = "AUDIO_TRANSCRIPTION"
  val TYPED = "TYPED"
}

object CaptionDAO {

  def insertOrUpdateAudioCaption(captionId: String, meetingId: String, userId: String, transcript: String, locale: String) = {
    DatabaseConnection.db.run(
      TableQuery[CaptionTableDef].insertOrUpdate(
        CaptionDbModel(
          captionId = captionId,
          meetingId = meetingId,
          captionType = CaptionTypes.AUDIO_TRANSCRIPTION,
          userId = userId,
          locale = locale,
          captionText = transcript,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(_) => DatabaseConnection.logger.debug(s"Upserted caption with ID $captionId on Caption table")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error upserting caption on Caption: $e")
      }
  }
}
