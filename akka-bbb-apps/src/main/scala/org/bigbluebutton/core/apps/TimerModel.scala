package org.bigbluebutton.core.apps

object TimerModel {
  def createTimer(
      model:          TimerModel,
      stopwatch:      Boolean = true,
      time:           Int = 0,
      accumulated:    Int = 0,
      track:          String = "",
  ): Unit = {
    model.stopwatch = stopwatch
    model.time = time
    model.accumulated = accumulated
    model.track = track
  }

  def reset(model: TimerModel, stopwatch: Boolean, time: Int, accumulated: Int, startedAt: Long, track: String) : Unit = {
    model.stopwatch = stopwatch
    model.time = time
    model.accumulated = accumulated
    model.startedAt = startedAt
    model.track = track
    model.endedAt = 0
  }

  def setIsActive(model: TimerModel, active: Boolean): Unit = {
    model.isActive = active
  }

  def getIsACtive(model: TimerModel): Boolean = {
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
    model.running = running
  }

  def getRunning(model: TimerModel): Boolean = {
    model.running
  }

  def setStopwatch(model: TimerModel, stopwatch: Boolean): Unit = {
    model.stopwatch = stopwatch
  }

  def getStopwatch(model: TimerModel): Boolean = {
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

  def setEndedAt(model: TimerModel, timestamp: Long): Unit = {
    model.endedAt = timestamp
  }

  def getEndedAt(model: TimerModel): Long = {
    model.endedAt
  }
}

class TimerModel {
  private var startedAt: Long = 0
  private var endedAt: Long = 0
  private var accumulated: Int = 0
  private var running: Boolean = false
  private var time: Int = 0
  private var stopwatch: Boolean = true
  private var track: String = ""
  private var isActive: Boolean = false
}
