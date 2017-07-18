package org.bigbluebutton.core.util

import java.util.concurrent.TimeUnit

object TimeUtil {
  def minutesToMillis(minutes: Long): Long = {
    TimeUnit.MINUTES.toMillis(minutes)
  }

  def millisToMinutes(millis: Long): Long = {
    TimeUnit.MILLISECONDS.toMinutes(millis)
  }

  def minutesToSeconds(minutes: Long): Long = {
    TimeUnit.MINUTES.toSeconds(minutes)
  }
}
