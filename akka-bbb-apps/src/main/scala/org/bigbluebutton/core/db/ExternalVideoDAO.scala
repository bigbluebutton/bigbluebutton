package org.bigbluebutton.core.db

import org.bigbluebutton.core.util.RandomStringGenerator
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class ExternalVideoDbModel(
    externalVideoId:    String,
    meetingId:          String,
    externalVideoUrl:   String,
    startedSharingAt:   java.sql.Timestamp,
    stoppedSharingAt:   Option[java.sql.Timestamp],
    updatedAt:          java.sql.Timestamp,
    playerPlaybackRate: Double,
    playerCurrentTime:  Double,
    playerPlaying:      Boolean
)

class ExternalVideoDbTableDef(tag: Tag) extends Table[ExternalVideoDbModel](tag, "externalVideo") {
  val externalVideoId = column[String]("externalVideoId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val externalVideoUrl = column[String]("externalVideoUrl")
  val startedSharingAt = column[java.sql.Timestamp]("startedSharingAt")
  val stoppedSharingAt = column[Option[java.sql.Timestamp]]("stoppedSharingAt")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  val playerPlaybackRate = column[Double]("playerPlaybackRate")
  val playerCurrentTime = column[Double]("playerCurrentTime")
  val playerPlaying = column[Boolean]("playerPlaying")
  override def * : ProvenShape[ExternalVideoDbModel] = (externalVideoId, meetingId, externalVideoUrl, startedSharingAt, stoppedSharingAt, updatedAt, playerPlaybackRate, playerCurrentTime, playerPlaying) <> (ExternalVideoDbModel.tupled, ExternalVideoDbModel.unapply)
}

object ExternalVideoDAO {
  def insert(meetingId: String, externalVideoUrl: String) = {
    DatabaseConnection.db.run(
      TableQuery[ExternalVideoDbTableDef].forceInsert(
        ExternalVideoDbModel(
          externalVideoId = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8),
          meetingId = meetingId,
          externalVideoUrl = externalVideoUrl,
          startedSharingAt = new java.sql.Timestamp(System.currentTimeMillis()),
          stoppedSharingAt = None,
          updatedAt = new java.sql.Timestamp(System.currentTimeMillis()),
          playerPlaybackRate = 1,
          playerCurrentTime = 0,
          playerPlaying = true
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in ExternalVideo table!")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error inserting ExternalVideo: $e")
      }
  }

  def update(meetingId: String, status: String, rate: Double, time: Double, state: Int) = {
    DatabaseConnection.db.run(
      TableQuery[ExternalVideoDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.stoppedSharingAt.isEmpty)
        .map(ev => (ev.playerPlaybackRate, ev.playerCurrentTime, ev.playerPlaying, ev.updatedAt))
        .update((
          rate,
          time,
          status match {
            case "play" => true
            case "stop" => false
            case _ => state match {
              case 1 => true
              case 0 => false
            }
          },
          new java.sql.Timestamp(System.currentTimeMillis())
        ))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on ExternalVideo table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating ExternalVideo: $e")
      }
  }

  def updateStoppedSharing(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[ExternalVideoDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.stoppedSharingAt.isEmpty)
        .map(ev => (ev.stoppedSharingAt, ev.playerPlaying))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())), false)
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated stoppedSharingAt on ExternalVideo table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating stoppedSharingAt on ExternalVideo: $e")
      }
  }

}