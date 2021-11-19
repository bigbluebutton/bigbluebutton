/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2019 BigBlueButton Inc. and by respective authors (see below).
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

class UpdateExternalVideoRecordEvent extends AbstractExternalVideoRecordEvent {
  import UpdateExternalVideoRecordEvent._

  setEvent("UpdateExternalVideoRecordEvent")

  def setStatus(status: String) {
    eventMap.put(STATUS, status)
  }

  def setRate(rate: Double) {
    eventMap.put(RATE, rate.toString)
  }

  def setTime(time: Double) {
    eventMap.put(TIME, time.toString)
  }

  def setState(state: Int) {
    eventMap.put(STATE, state.toString)
  }
}

object UpdateExternalVideoRecordEvent {
  protected final val STATUS = "status"
  protected final val RATE = "rate"
  protected final val TIME = "time"
  protected final val STATE = "state"
}
