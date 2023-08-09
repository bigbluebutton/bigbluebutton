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
    //    DatabaseConnection.db.run(
    //      TableQuery[AudioCaptionTableDef]
    //        .filter(_.transcriptId === transcriptId)
    //        .map(a => a.transcript)
    //        .update((transcript))
    //    ).onComplete {
    //        case Success(rowsAffected) => rowsAffected match {
    //          case 0 => DatabaseConnection.db.run(
    //            TableQuery[AudioCaptionTableDef] += AudioCaptionDbModel(transcriptId, meetingId, transcript)
    //          ).onComplete {
    //              case Success    => DatabaseConnection.logger.debug(s"Inserted new audio caption with ID $transcriptId on AudioCaption table")
    //              case Failure(e) => DatabaseConnection.logger.debug(s"Error inserting or updating audio caption on AudioCaption: $e")
    //            }
    //          case 1 => DatabaseConnection.logger.debug(s"Updated audio caption with ID $transcriptId on AudioCaption table")
    //          case n => DatabaseConnection.logger.debug(s"Error: Expected to insert or update a single row not $n rows")
    //        }
    //        case Failure(e) => DatabaseConnection.logger.debug(s"Error updating audio caption on AudioCaption: $e")
    //      }
    TableQuery[AudioCaptionTableDef].insertOrUpdate(
      AudioCaptionDbModel(
        transcriptId = transcriptId,
        meetingId = meetingId,
        transcript = transcript
      )
    )
  }
}
