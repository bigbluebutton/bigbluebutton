package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.TimerModel
import org.bigbluebutton.core.apps.TimerModel.{getAccumulated, getIsActive, isRunning, getStartedAt, isStopwatch, getTime, getTrack}
import slick.jdbc.PostgresProfile.api._

case class TimerDbModel(
    meetingId:        String,
    stopwatch:        Boolean,
    running:          Boolean,
    active:           Boolean,
    time:             Long,
    accumulated:      Long,
    startedOn:        Long,
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
  val songTrack = column[String]("songTrack")
  override def * = (meetingId, stopwatch, running, active, time, accumulated, startedOn, songTrack) <> (TimerDbModel.tupled, TimerDbModel.unapply)
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
          startedOn = getStartedAt(model),
          songTrack = getTrack(model),
        )
      )
    )
  }

  def update(meetingId: String, timerModel: TimerModel) = {
    DatabaseConnection.enqueue(
      TableQuery[TimerDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(t => (t.stopwatch, t.running, t.active, t.time, t.accumulated, t.startedOn, t.songTrack))
        .update(
          (isStopwatch(timerModel), isRunning(timerModel), getIsActive(timerModel), getTime(timerModel),
          getAccumulated(timerModel), getStartedAt(timerModel), getTrack(timerModel))
        )
    )
  }
}