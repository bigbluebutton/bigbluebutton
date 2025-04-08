package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

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

  def insertOrUpdateCaption(captionId: String, meetingId: String, userId: String, transcript: String,
                            locale: String, captionType: String = CaptionTypes.AUDIO_TRANSCRIPTION) = {
    DatabaseConnection.enqueue(
      TableQuery[CaptionTableDef].insertOrUpdate(
        CaptionDbModel(
          captionId = captionId,
          meetingId = meetingId,
          captionType = captionType,
          userId = userId,
          locale = locale,
          captionText = transcript,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    )
  }
}
