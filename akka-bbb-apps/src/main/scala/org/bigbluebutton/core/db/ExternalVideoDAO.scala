package org.bigbluebutton.core.db

import org.bigbluebutton.core.util.RandomStringGenerator
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class ExternalVideoDbModel(
    externalVideoId:  String,
    meetingId:        String,
    externalVideoUrl: String,
    startedAt:        java.sql.Timestamp         = new java.sql.Timestamp(System.currentTimeMillis()),
    stoppedAt:        Option[java.sql.Timestamp],
    lastEventAt:      Option[java.sql.Timestamp],
    lastEventDesc:    String,
    playerRate:       Double,
    playerTime:       Double,
    playerState:      Int
)

class ExternalVideoDbTableDef(tag: Tag) extends Table[ExternalVideoDbModel](tag, "external_video") {
  val externalVideoId = column[String]("externalVideoId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val externalVideoUrl = column[String]("externalVideoUrl")
  val startedAt = column[java.sql.Timestamp]("startedAt")
  val stoppedAt = column[Option[java.sql.Timestamp]]("stoppedAt")
  val lastEventAt = column[Option[java.sql.Timestamp]]("lastEventAt")
  val lastEventDesc = column[String]("lastEventDesc")
  val playerRate = column[Double]("playerRate")
  val playerTime = column[Double]("playerTime")
  val playerState = column[Int]("playerState")
  override def * : ProvenShape[ExternalVideoDbModel] = (externalVideoId, meetingId, externalVideoUrl, startedAt, stoppedAt, lastEventAt, lastEventDesc, playerRate, playerTime, playerState) <> (ExternalVideoDbModel.tupled, ExternalVideoDbModel.unapply)
}

object ExternalVideoDAO {
  def insert(meetingId: String, externalVideoUrl: String) = {
    DatabaseConnection.db.run(
      TableQuery[ExternalVideoDbTableDef].forceInsert(
        ExternalVideoDbModel(
          externalVideoId = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8),
          meetingId = meetingId,
          externalVideoUrl = externalVideoUrl,
          startedAt = new java.sql.Timestamp(System.currentTimeMillis()),
          stoppedAt = None,
          lastEventAt = None,
          lastEventDesc = "",
          playerRate = 0,
          playerTime = 0,
          playerState = 0,
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in ExternalVideo table!")
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting ExternalVideo: $e")
      }
  }

  def update(meetingId: String, status: String, rate: Double, time: Double, state: Int) = {
    DatabaseConnection.db.run(
      TableQuery[ExternalVideoDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.stoppedAt.isEmpty)
        .map(ev => (ev.lastEventDesc, ev.playerRate, ev.playerTime, ev.playerState, ev.lastEventAt))
        .update((status, rate, time, state, Some(new java.sql.Timestamp(System.currentTimeMillis()))))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on ExternalVideo table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating ExternalVideo: $e")
    }
  }

  def updateStopped(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[ExternalVideoDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.stoppedAt.isEmpty)
        .map(ev => ev.stoppedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated stoppedAt on ExternalVideo table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating stoppedAt on ExternalVideo: $e")
    }
  }

}