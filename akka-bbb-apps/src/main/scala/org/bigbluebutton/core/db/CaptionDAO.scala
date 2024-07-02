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

  def insertOrUpdatePadCaption(meetingId: String, locale: String, userId: String, text: String) = {

    val lines: Array[String] = text.split("\\r?\\n").filter(_.trim.nonEmpty)
    val lastTwoLines = lines.takeRight(2)

    val actions: Seq[DBIO[Int]] = lastTwoLines.map { line =>
      sqlu"""
        WITH upsert AS (
          UPDATE caption
          SET "captionText"=${line},
          "createdAt" = current_timestamp
          WHERE "captionId" in (
                  SELECT "captionId"
                  FROM (
                    SELECT "captionId", "captionText", "createdAt"
                    FROM caption
                    WHERE "meetingId" = ${meetingId}
                    AND locale = ${locale}
                    AND "captionType" = ${CaptionTypes.TYPED}
                    order by "createdAt" desc
                    limit 2
                  ) a
                  WHERE ${line} != "captionText"
                  AND (${line} LIKE "captionText" || '%' or "captionText" LIKE ${line} || '%')
                  AND ABS(length("captionText") - length(${line})) < 25
                  ORDER BY "createdAt" desc
                  LIMIT 1
                )
          RETURNING *)
        INSERT INTO caption ("captionId", "meetingId", "captionType", "userId", "locale", "captionText", "createdAt")
        SELECT md5(random()::text || clock_timestamp()::text), ${meetingId}, 'TYPED', ${userId}, ${locale}, ${line}, current_timestamp
        WHERE NOT EXISTS (SELECT * FROM upsert)
        AND ${line} NOT IN (SELECT "captionText"
                    FROM caption
                    WHERE "meetingId" = ${meetingId}
                    AND locale = ${locale}
                    AND "captionType" = ${CaptionTypes.TYPED}
                    order by "createdAt" desc
                    limit 2
                  )"""
    }

    DatabaseConnection.enqueue(DBIO.sequence(actions).transactionally)
  }
}
