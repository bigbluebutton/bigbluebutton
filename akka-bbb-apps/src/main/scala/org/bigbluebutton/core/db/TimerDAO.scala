package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.TimerModel
import org.bigbluebutton.core.apps.TimerModel.{getAccumulated, getIsActive, isRunning, getStartedAt, isStopwatch, getTime, getTrack, isElapsed}
import slick.jdbc.PostgresProfile.api._

case class TimerDbModel(
    meetingId:        String,
    stopwatch:        Boolean,
    running:          Boolean,
    active:           Boolean,
    time:             Long,
    accumulated:      Long,
    startedAt:        Option[Long],
    songTrack:        String,
    elapsed:          Boolean,
)

class TimerDbTableDef(tag: Tag) extends Table[TimerDbModel](tag, None, "timer") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val stopwatch = column[Boolean]("stopwatch")
  val running = column[Boolean]("running")
  val active = column[Boolean]("active")
  val time = column[Long]("time")
  val accumulated = column[Long]("accumulated")
  val startedAt = column[Option[Long]]("startedAt")
  val songTrack = column[String]("songTrack")
  val elapsed = column[Boolean]("elapsed")
  override def * = (meetingId, stopwatch, running, active, time, accumulated, startedAt, songTrack, elapsed) <> (TimerDbModel.tupled, TimerDbModel.unapply)
}

object TimerDAO {
  def insert(meetingId: String, model: TimerModel) = {
    DatabaseConnection.enqueue(
      TableQuery[TimerDbTableDef].insertOrUpdate(
        TimerDbModel(
          meetingId = meetingId,
          stopwatch = isStopwatch(model),
          running = isRunning(model),
          active = getIsActive(model),
          time = getTime(model),
          accumulated = getAccumulated(model),
          startedAt = getStartedAt(model).map(_.getTime),
          songTrack = getTrack(model),
          elapsed = isElapsed(model),
        )
      )
    )
  }

  def update(meetingId: String, timerModel: TimerModel) = {
    DatabaseConnection.enqueue(
      TableQuery[TimerDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(t => (t.stopwatch, t.running, t.active, t.time, t.accumulated, t.startedAt, t.songTrack, t.elapsed))
        .update(
          (isStopwatch(timerModel), isRunning(timerModel), getIsActive(timerModel), getTime(timerModel),
          getAccumulated(timerModel), getStartedAt(timerModel).map(_.getTime), getTrack(timerModel), isElapsed(timerModel))
        )
    )
  }
}