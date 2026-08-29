package org.bigbluebutton.core.apps

object TimerModel {
  def createTimer(
      model:          TimerModel,
      stopwatch:      Boolean = true,
      time:           Int = 0,
      accumulated:    Int = 0,
      track:          String = "noTrack",
      elapsed:        Boolean = false,
  ): Unit = {
    model.stopwatch = stopwatch
    model.time = time
    model.accumulated = accumulated
    model.track = track
    model.elapsed = elapsed
  }

  def reset(model: TimerModel) : Unit = {
    model.accumulated = 0
    model.startedAt = if (model.running) Some(new java.sql.Timestamp(System.currentTimeMillis())) else None
  }

  def setIsActive(model: TimerModel, active: Boolean): Unit = {
    model.isActive = active
  }

  def getIsActive(model: TimerModel): Boolean = {
    model.isActive
  }

  def setStartedAt(model: TimerModel, timestamp: Option[java.sql.Timestamp] = None): Unit = {
    model.startedAt = timestamp
  }

  def getStartedAt(model: TimerModel): Option[java.sql.Timestamp] = {
    model.startedAt
  }

  def setAccumulated(model: TimerModel, accumulated: Int): Unit = {
    model.accumulated = accumulated
  }

  def getAccumulated(model: TimerModel): Int = {
    model.accumulated
  }

  def setElapsed(model: TimerModel, elapsed: Boolean): Unit = {
    model.elapsed = elapsed
  }

  def isElapsed(model: TimerModel): Boolean = {
    model.elapsed
  }

  def setRunning(model: TimerModel, running: Boolean): Unit = {
    resetTimerIfFinished(model)

    val now = System.currentTimeMillis()

    // If the timer is running and will stop, update accumulated time
    if (isRunning(model) && !running) {
      val accumulated = getAccumulated(model) + 
        getStartedAt(model).map(ts => Math.abs(now - ts.getTime).toInt).getOrElse(0)
      setAccumulated(model, accumulated)
    }

    // If the timer is not running and will start, set the start time
    if (!isRunning(model) && running) {
      setElapsed(model, false) 
      setStartedAt(model, Some(new java.sql.Timestamp(now)))
    }

    // Update the running status of the model
    model.running = running
  }

  def resetTimerIfFinished(model: TimerModel) = {
    // If the timer is finished, reset the accumulated time and start time if running
    val finished = getStartedAt(model).exists { startedAtTs => 
      val finishTime = startedAtTs.getTime + (model.time - model.accumulated)
      isRunning(model) &&
        !isStopwatch(model) &&
        finishTime < System.currentTimeMillis()
    }

    if (finished) {
      model.running = false
      model.elapsed = true
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
  private var startedAt: Option[java.sql.Timestamp] = None
  private var accumulated: Int = 0
  private var running: Boolean = false
  private var time: Int = 0
  private var stopwatch: Boolean = true
  private var track: String = "noTrack"
  private var isActive: Boolean = false
  private var elapsed: Boolean = false
}
