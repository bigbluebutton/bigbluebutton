package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

import java.sql.Timestamp
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class AudioCaptionDbModel(
    transcriptId: String,
    meetingId:    String,
    userId:       String,
    lang:         String,
    transcript:   String,
    createdAt:    java.sql.Timestamp
)

class AudioCaptionTableDef(tag: Tag) extends Table[AudioCaptionDbModel](tag, None, "audio_caption") {
  val transcriptId = column[String]("transcriptId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val lang = column[String]("lang")
  val transcript = column[String]("transcript")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  def * = (transcriptId, meetingId, userId, lang, transcript, createdAt) <> (AudioCaptionDbModel.tupled, AudioCaptionDbModel.unapply)
}

object AudioCaptionDAO {

  def insertOrUpdateAudioCaption(transcriptId: String, meetingId: String, userId: String, transcript: String) = {
    DatabaseConnection.db.run(
      TableQuery[AudioCaptionTableDef].insertOrUpdate(
        AudioCaptionDbModel(
          transcriptId = transcriptId,
          meetingId = meetingId,
          userId = userId,
          lang = "",
          transcript = transcript,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(_) => DatabaseConnection.logger.debug(s"Upserted audio caption with ID $transcriptId on AudioCaption table")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error upserting audio caption on AudioCaption: $e")
      }
  }

  def insertOrUpdatePadCaption(meetingId: String, locale: String, userId: String, transcript: String) = {

    val lines: Array[String] = transcript.split("\\r?\\n").filter(_.trim.nonEmpty)
    val lastTwoLines = lines.takeRight(2)

    val actions: Seq[DBIO[Int]] = lastTwoLines.map { line =>
      sqlu"""
        WITH upsert AS (
          UPDATE audio_caption
          SET transcript=${line},
          "createdAt" = current_timestamp
          WHERE "meetingId" = ${meetingId}
          AND (${line} LIKE transcript || '%' or transcript LIKE ${line} || '%')
          AND ${line} != transcript
          AND lang = ${locale}
          AND "createdAt" > current_timestamp - interval '15 seconds'
          RETURNING *)
        INSERT INTO audio_caption ("transcriptId", "meetingId", "userId", "lang", "transcript", "createdAt")
        SELECT md5(random()::text || clock_timestamp()::text), ${meetingId}, ${userId}, 'en', ${line}, current_timestamp
        WHERE NOT EXISTS (SELECT * FROM upsert)
        AND ${line} NOT IN (SELECT transcript
                    FROM audio_caption
                    WHERE "meetingId" = ${meetingId}
                    AND lang = ${locale}
                    order by "createdAt" desc
                    limit 2
                  )"""
    }

    DatabaseConnection.db.run(DBIO.sequence(actions).transactionally).onComplete {
      case Success(rowsAffected) =>
        val total = rowsAffected.sum
        DatabaseConnection.logger.debug(s"$total row(s) affected in audio_caption table!")
      case Failure(e) =>
        DatabaseConnection.logger.error(s"Error executing action: ", e)
    }
  }
}
