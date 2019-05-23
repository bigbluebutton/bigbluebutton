package org.bigbluebutton.api2.util

import org.apache.commons.lang3.StringUtils

object Util2 {
  def getFirstPartOfMeetingId(meetingId: String): Option[String] = {
    val segments: Array[String] = StringUtils.split(meetingId, "-")
    if (segments.length == 2) {
      Some(segments(0))
    } else {
      None
    }
  }
}
