package org.bigbluebutton.core.db

import org.bigbluebutton.core.util.RandomStringGenerator
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

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
  def insert(meetingId: String, externalVideoUrl: String, initialTime: Double): Unit = {
    DatabaseConnection.enqueue(
      TableQuery[ExternalVideoDbTableDef].forceInsert(
        ExternalVideoDbModel(
          externalVideoId = System.currentTimeMillis() + "-" + RandomStringGenerator.randomAlphanumericString(8),
          meetingId = meetingId,
          externalVideoUrl = externalVideoUrl,
          startedSharingAt = new java.sql.Timestamp(System.currentTimeMillis()),
          stoppedSharingAt = None,
          updatedAt = new java.sql.Timestamp(System.currentTimeMillis()),
          playerPlaybackRate = 1,
          playerCurrentTime = initialTime,
          playerPlaying = true
        )
      )
    )
  }

  def update(meetingId: String, status: String, rate: Double, time: Double, state: Int) = {
    DatabaseConnection.enqueue(
      TableQuery[ExternalVideoDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.stoppedSharingAt.isEmpty)
        .map(ev => (ev.playerPlaybackRate, ev.playerCurrentTime, ev.playerPlaying, ev.updatedAt))
        .update((
          rate,
          time,
          status match {
            case "play"  => true
            case "start" => true
            case "stop"  => false
            case _ => state match {
              case 1 => true
              case 0 => false
            }
          },
          new java.sql.Timestamp(System.currentTimeMillis())
        ))
    )
  }

  def updateStoppedSharing(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[ExternalVideoDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.stoppedSharingAt.isEmpty)
        .map(ev => (ev.stoppedSharingAt, ev.playerPlaying))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())), false)
    )
  }

}