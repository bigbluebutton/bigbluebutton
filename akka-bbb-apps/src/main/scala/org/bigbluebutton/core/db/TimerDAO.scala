package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.TimerModel
import org.bigbluebutton.core.apps.TimerModel.{getAccumulated, getEndedAt, getIsACtive, getRunning, getStartedAt, getStopwatch, getTime, getTrack}
import slick.jdbc.PostgresProfile.api._

import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

case class TimerDbModel(
    meetingId:        String,
    stopwatch:        Boolean,
    running:          Boolean,
    active:           Boolean,
    time:             Long,
    accumulated:      Long,
    startedAt:        Long,
    endedAt:          Long,
    songTrack:        String,
)

class TimerDbTableDef(tag: Tag) extends Table[TimerDbModel](tag, None, "timer") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val stopwatch = column[Boolean]("stopwatch")
  val running = column[Boolean]("running")
  val active = column[Boolean]("active")
  val time = column[Long]("time")
  val accumulated = column[Long]("accumulated")
  val startedAt = column[Long]("startedAt")
  val endedAt = column[Long]("endedAt")
  val songTrack = column[String]("songTrack")
  override def * = (meetingId, stopwatch, running, active, time, accumulated, startedAt, endedAt, songTrack) <> (TimerDbModel.tupled, TimerDbModel.unapply)
}

object TimerDAO {
  def insert(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[TimerDbTableDef].insertOrUpdate(
        TimerDbModel(
          meetingId = meetingId,
          stopwatch = true,
          running = false,
          active = false,
          time = 300000,
          accumulated = 0,
          startedAt = 0,
          endedAt = 0,
          songTrack = "noTrack",
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on Timer table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting Timer: $e")
      }
  }

  def update(meetingId: String, timerModel: TimerModel) = {
    DatabaseConnection.db.run(
      TableQuery[TimerDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(t => (t.stopwatch, t.running, t.active, t.time, t.accumulated, t.startedAt, t.endedAt, t.songTrack))
        .update((getStopwatch(timerModel), getRunning(timerModel), getIsACtive(timerModel), getTime(timerModel), getAccumulated(timerModel), getStartedAt(timerModel), getEndedAt(timerModel), getTrack(timerModel))
        )
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on Timer table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating Timer: $e")
    }
  }
}