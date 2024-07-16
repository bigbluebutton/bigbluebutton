package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

case class CaptionLocaleDbModel(
    meetingId:   String,
    locale:      String,
    captionType: String,
    createdBy:   String,
    updatedAt:   java.sql.Timestamp
)

class CaptionLocaleTableDef(tag: Tag) extends Table[CaptionLocaleDbModel](tag, None, "caption_locale") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val locale = column[String]("locale", O.PrimaryKey)
  val captionType = column[String]("captionType", O.PrimaryKey)
  val createdBy = column[String]("createdBy")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  def * = (meetingId, locale, captionType, createdBy, updatedAt) <> (CaptionLocaleDbModel.tupled, CaptionLocaleDbModel.unapply)
}

object CaptionLocaleDAO {
  def insertOrUpdateCaptionLocale(meetingId: String, locale: String, captionType: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[CaptionLocaleTableDef].insertOrUpdate(
        CaptionLocaleDbModel(
          meetingId = meetingId,
          locale = locale,
          captionType = captionType,
          createdBy = userId,
          updatedAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    )
  }
}
