package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class CaptionLocaleDbModel(
    meetingId:   String,
    locale:      String,
    captionType: String,
    ownerUserId: String,
    updatedAt:   java.sql.Timestamp
)

class CaptionLocaleTableDef(tag: Tag) extends Table[CaptionLocaleDbModel](tag, None, "caption_locale") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val locale = column[String]("locale", O.PrimaryKey)
  val captionType = column[String]("captionType", O.PrimaryKey)
  val ownerUserId = column[String]("ownerUserId")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  def * = (meetingId, locale, captionType, ownerUserId, updatedAt) <> (CaptionLocaleDbModel.tupled, CaptionLocaleDbModel.unapply)
}

object CaptionLocaleDAO {
  def insertOrUpdateCaptionLocale(meetingId: String, locale: String, captionType: String, ownerUserId: String) = {
    DatabaseConnection.db.run(
      TableQuery[CaptionLocaleTableDef].insertOrUpdate(
        CaptionLocaleDbModel(
          meetingId = meetingId,
          locale = locale,
          captionType = captionType,
          ownerUserId = ownerUserId,
          updatedAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(_) => DatabaseConnection.logger.debug(s"Upserted caption with ID $meetingId-$locale on CaptionLocale table")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error upserting caption on CaptionLocale: $e")
      }
  }
}
