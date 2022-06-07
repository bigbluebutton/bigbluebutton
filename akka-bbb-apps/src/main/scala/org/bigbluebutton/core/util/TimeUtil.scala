package org.bigbluebutton.core.util

import java.util.concurrent.TimeUnit

object TimeUtil {

  def minutesToMillis(minutes: Long): Long = {
    TimeUnit.MINUTES.toMillis(minutes)
  }

  def millisToMinutes(millis: Long): Long = {
    TimeUnit.MILLISECONDS.toMinutes(millis)
  }

  def millisToSeconds(millis: Long): Long = {
    TimeUnit.MILLISECONDS.toSeconds(millis)
  }

  def minutesToSeconds(minutes: Long): Long = {
    TimeUnit.MINUTES.toSeconds(minutes)
  }

  def secondsToMillis(seconds: Long): Long = {
    TimeUnit.SECONDS.toMillis(seconds)
  }

  def timeNowInMinutes(): Long = TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  def timeNowInSeconds(): Long = TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())
  def timeNowInMs(): Long = TimeUnit.NANOSECONDS.toMillis(System.nanoTime())
}
