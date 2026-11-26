/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2026 BigBlueButton Inc. and by respective authors (see below).
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

class RoomConfiguredRecordEvent extends AbstractParticipantRecordEvent {
  import RoomConfiguredRecordEvent._

  setEvent("RoomConfiguredEvent")

  def setUserId(userId: String) {
    eventMap.put(USER_ID, userId)
  }

  def setRoomMode(roomMode: String) {
    eventMap.put(ROOM_MODE, roomMode)
  }

  // JSON, shaped like the room's base settings (meeting.roomBaseSettings).
  def setSettings(settings: String) {
    eventMap.put(SETTINGS, settings)
  }
}

object RoomConfiguredRecordEvent {
  protected final val USER_ID = "userId"
  protected final val ROOM_MODE = "roomMode"
  protected final val SETTINGS = "settings"
}
