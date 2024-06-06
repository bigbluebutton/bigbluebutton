package org.bigbluebutton.core.db

import org.bigbluebutton.ClientSettings.{getConfigPropertyValueByPathAsBooleanOrElse, getConfigPropertyValueByPathAsIntOrElse}
import org.bigbluebutton.core.apps.TimerModel
import org.bigbluebutton.core.apps.TimerModel.{getAccumulated, getEndedAt, getIsActive, getRunning, getStartedAt, getStopwatch, getTime, getTrack}
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
    startedOn:        Long,
    endedOn:          Long,
    songTrack:        String,
)

class TimerDbTableDef(tag: Tag) extends Table[TimerDbModel](tag, None, "timer") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val stopwatch = column[Boolean]("stopwatch")
  val running = column[Boolean]("running")
  val active = column[Boolean]("active")
  val time = column[Long]("time")
  val accumulated = column[Long]("accumulated")
  val startedOn = column[Long]("startedOn")
  val endedOn = column[Long]("endedOn")
  val songTrack = column[String]("songTrack")
  override def * = (meetingId, stopwatch, running, active, time, accumulated, startedOn, endedOn, songTrack) <> (TimerDbModel.tupled, TimerDbModel.unapply)
}

object TimerDAO {
  def insert(meetingId: String, clientSettings: Map[String, Object]) = {
    val timerEnabled = getConfigPropertyValueByPathAsBooleanOrElse(clientSettings, "public.timer.enabled", alternativeValue = true)
    if(timerEnabled) {
      val timerDefaultTimeInMinutes = getConfigPropertyValueByPathAsIntOrElse(clientSettings, "public.timer.time", 5)
      val timerDefaultTimeInMilli = timerDefaultTimeInMinutes * 60000
      
      DatabaseConnection.db.run(
        TableQuery[TimerDbTableDef].insertOrUpdate(
          TimerDbModel(
            meetingId = meetingId,
            stopwatch = true,
            running = false,
            active = false,
            time = timerDefaultTimeInMilli,
            accumulated = 0,
            startedOn = 0,
            endedOn = 0,
            songTrack = "noTrack",
          )
        )
      ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on Timer table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting Timer: $e")
      }
    }
  }

  def update(meetingId: String, timerModel: TimerModel) = {
    DatabaseConnection.db.run(
      TableQuery[TimerDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(t => (t.stopwatch, t.running, t.active, t.time, t.accumulated, t.startedOn, t.endedOn, t.songTrack))
        .update((getStopwatch(timerModel), getRunning(timerModel), getIsActive(timerModel), getTime(timerModel), getAccumulated(timerModel), getStartedAt(timerModel), getEndedAt(timerModel), getTrack(timerModel))
        )
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on Timer table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating Timer: $e")
    }
  }
}