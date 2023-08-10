package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class AudioCaptionDbModel(
    transcriptId: String,
    meetingId:    String,
    transcript:   String
)

class AudioCaptionTableDef(tag: Tag) extends Table[AudioCaptionDbModel](tag, None, "audio_caption") {
  val transcriptId = column[String]("transcriptId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val transcript = column[String]("transcript")
  def * = (transcriptId, meetingId, transcript) <> (AudioCaptionDbModel.tupled, AudioCaptionDbModel.unapply)
}

object AudioCaptionDAO {

  def insertOrUpdateAudioCaption(transcriptId: String, meetingId: String, transcript: String) = {
    DatabaseConnection.db.run(
      TableQuery[AudioCaptionTableDef].insertOrUpdate(
        AudioCaptionDbModel(
          transcriptId = transcriptId,
          meetingId = meetingId,
          transcript = transcript
        )
      )
    ).onComplete {
        case Success(_) => DatabaseConnection.logger.debug(s"Upserted audio caption with ID $transcriptId on AudioCaption table")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error upserting audio caption on AudioCaption: $e")
      }
  }
}
