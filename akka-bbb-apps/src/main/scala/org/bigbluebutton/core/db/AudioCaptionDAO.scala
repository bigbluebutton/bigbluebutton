package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class AudioCaptionDbModel(
    transcriptId: String,
    meetingId:    String,
    userId:       String,
    transcript:   String,
    createdAt:    java.sql.Timestamp
)

class AudioCaptionTableDef(tag: Tag) extends Table[AudioCaptionDbModel](tag, None, "audio_caption") {
  val transcriptId = column[String]("transcriptId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val transcript = column[String]("transcript")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  def * = (transcriptId, meetingId, userId, transcript, createdAt) <> (AudioCaptionDbModel.tupled, AudioCaptionDbModel.unapply)
}

object AudioCaptionDAO {

  def insertOrUpdateAudioCaption(transcriptId: String, meetingId: String, userId: String, transcript: String, createdAt: java.sql.Timestamp) = {
    DatabaseConnection.db.run(
      TableQuery[AudioCaptionTableDef].insertOrUpdate(
        AudioCaptionDbModel(
          transcriptId = transcriptId,
          meetingId = meetingId,
          userId = userId,
          transcript = transcript,
          createdAt = createdAt
        )
      )
    ).onComplete {
        case Success(_) => DatabaseConnection.logger.debug(s"Upserted audio caption with ID $transcriptId on AudioCaption table")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error upserting audio caption on AudioCaption: $e")
      }
  }
}
