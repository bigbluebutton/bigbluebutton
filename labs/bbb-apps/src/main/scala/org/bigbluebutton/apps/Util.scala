package org.bigbluebutton.apps

import org.apache.commons.codec.digest.DigestUtils
import java.util.TimeZone
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.Date

/**
 * Some utilities.
 */
object Util {

  /**
   * Convert the external meeting id passed from 3rd-party applications
   * into an internal meeting id.
   */
  def toInternalMeetingId(externalMeetingId: String) =
    DigestUtils.sha1Hex(externalMeetingId)

  def generateTimestamp(): String = {
    val tz: TimeZone = TimeZone.getTimeZone("UTC");
    val df: DateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
    df.setTimeZone(tz);
    df.format(new Date());
  }
}