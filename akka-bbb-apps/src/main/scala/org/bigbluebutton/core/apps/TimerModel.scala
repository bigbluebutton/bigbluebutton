package org.bigbluebutton.core.apps

object TimerModel {
  def createTimer(
      model:          TimerModel,
      stopwatch:      Boolean = true,
      time:           Int = 0,
      accumulated:    Int = 0,
      track:          String = "noTrack",
  ): Unit = {
    model.stopwatch = stopwatch
    model.time = time
    model.accumulated = accumulated
    model.track = track
  }

  def reset(model: TimerModel) : Unit = {
    model.accumulated = 0
    model.startedAt = if (model.running) System.currentTimeMillis() else 0
  }

  def setIsActive(model: TimerModel, active: Boolean): Unit = {
    model.isActive = active
  }

  def getIsActive(model: TimerModel): Boolean = {
    model.isActive
  }

  def setStartedAt(model: TimerModel, timestamp: Long): Unit = {
    model.startedAt = timestamp
  }

  def getStartedAt(model: TimerModel): Long = {
    model.startedAt
  }

  def setAccumulated(model: TimerModel, accumulated: Int): Unit = {
    model.accumulated = accumulated
  }

  def getAccumulated(model: TimerModel): Int = {
    model.accumulated
  }

  def setRunning(model: TimerModel, running: Boolean): Unit = {
    resetTimerIfFinished(model)

    val now = System.currentTimeMillis()

    // If the timer is running and will stop, update accumulated time
    if (isRunning(model) && !running) {
      val accumulated = getAccumulated(model) + Math.abs(now - getStartedAt(model)).toInt
      setAccumulated(model, accumulated)
      setStartedAt(model, 0)
    }

    // If the timer is not running and will start, set the start time
    if (!isRunning(model) && running) {
      setStartedAt(model, now)
    }

    // Update the running status of the model
    model.running = running
  }

  def resetTimerIfFinished(model: TimerModel) = {
    // If the timer is finished, reset the accumulated time and start time if running
    if (isRunning(model)
      && !isStopwatch(model)
      && (model.startedAt + (model.time - model.accumulated)) < System.currentTimeMillis()) {
      model.running = false
      reset(model)
      true
    } else {
      false
    }
  }

  def isRunning(model: TimerModel): Boolean = {
    model.running
  }

  def setStopwatch(model: TimerModel, stopwatch: Boolean): Unit = {
    model.stopwatch = stopwatch
  }

  def isStopwatch(model: TimerModel): Boolean = {
    model.stopwatch
  }

  def setTrack(model: TimerModel, track: String): Unit = {
    model.track = track
  }

  def getTrack(model: TimerModel): String = {
    model.track
  }

  def setTime(model: TimerModel, time: Int): Unit = {
    model.time = time
  }

  def getTime(model: TimerModel): Int = {
    model.time
  }
}

class TimerModel {
  private var startedAt: Long = 0
  private var accumulated: Int = 0
  private var running: Boolean = false
  private var time: Int = 0
  private var stopwatch: Boolean = true
  private var track: String = "noTrack"
  private var isActive: Boolean = false
}
