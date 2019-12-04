package org.bigbluebutton.app.screenshare.server.util

import java.util.concurrent.TimeUnit

object TimeUtil {

  def generateTimestamp(): Long = {
    TimeUnit.NANOSECONDS.toMillis(System.nanoTime())
  }

  def getCurrentMonoTime(): Long = {
    TimeUnit.NANOSECONDS.toMillis(System.nanoTime())
  }

  def millisToSeconds(millis: Long): Long = {
    TimeUnit.MILLISECONDS.toSeconds(millis)
  }

  def currentMonoTimeInSeconds(): Long = {
    millisToSeconds(getCurrentMonoTime())
  }

  def getCurrentTime(): Long = {
    System.currentTimeMillis();
  }
}