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

class PublicChatRecordEvent extends AbstractChatRecordEvent {
  import PublicChatRecordEvent._

  setEvent("PublicChatEvent")

  def setSender(sender: String) {
    eventMap.put(SENDER, sender)
  }

  def setSenderId(senderId: String) {
    eventMap.put(SENDERID, senderId)
  }

  def setMessage(message: String) {
    eventMap.put(MESSAGE, message)
  }

  def setColor(color: String) {
    eventMap.put(COLOR, color)
  }
}

object PublicChatRecordEvent {
  private final val SENDER = "sender"
  private final val SENDERID = "senderId"
  private final val MESSAGE = "message"
  private final val COLOR = "color"
}