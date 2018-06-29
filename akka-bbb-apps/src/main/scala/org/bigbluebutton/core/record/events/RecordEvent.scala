/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bigbluebutton.core.record.events

import java.text.SimpleDateFormat

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.TimestampGenerator

trait RecordEvent {
  import RecordEvent._

  protected final val eventMap = new HashMap[String, String]()

  setTimestamp(TimestampGenerator.generateTimestamp())
  timestampUTC(System.currentTimeMillis())

  final def timestampUTC(utc: Long): Unit = {
    eventMap.put(TIMESTAMP_UTC, utc.toString)
    val sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX")
    eventMap.put(DATE, sdf.format(utc))
  }

  /**
   * Set the module that generated the event.
   * @param module
   */
  final def setModule(module: String) {
    eventMap.put(MODULE, module)
  }

  /**
   * Set the timestamp of the event.
   * @param timestamp
   */
  final def setTimestamp(timestamp: Long) {
    eventMap.put(TIMESTAMP, timestamp.toString)
  }

  /**
   * Set the meetingId for this particular event.
   * @param meetingId
   */
  final def setMeetingId(meetingId: String) {
    eventMap.put(MEETING, meetingId)
  }

  /**
   * Set the name of the event.
   * @param event
   */
  final def setEvent(event: String) {
    eventMap.put(EVENT, event)
  }

  /**
   * Convert the event into a Map to be recorded.
   * @return
   */
  final def toMap(): Map[String, String] = {
    eventMap.toMap
  }
}

object RecordEvent extends RecordEvent {
  protected final val MODULE = "module"
  protected final val TIMESTAMP = "timestamp"
  protected final val MEETING = "meetingId"
  protected final val EVENT = "eventName"
  protected final val TIMESTAMP_UTC = "timestampUTC"
  protected final val DATE = "date"
}