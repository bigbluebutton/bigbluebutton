/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2022 BigBlueButton Inc. and by respective authors (see below).
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

class AudioFloorChangedRecordEvent extends AbstractVoiceRecordEvent {
  import AudioFloorChangedRecordEvent._

  setEvent("AudioFloorChangedEvent")

  def setParticipant(p: String) {
    eventMap.put(PARTICIPANT, p)
  }

  def setFloor(floor: Boolean) {
    eventMap.put(FLOOR, floor.toString)
  }

  def setLastFloorTime(lastFloorTime: String) {
    eventMap.put(LAST_FLOOR_TIME, lastFloorTime)
  }
}

object AudioFloorChangedRecordEvent {
  protected final val PARTICIPANT = "participant"
  protected final val FLOOR = "floor"
  protected final val LAST_FLOOR_TIME = "lastFloorTime"
}
