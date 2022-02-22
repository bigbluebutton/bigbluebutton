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

  def setSenderId(senderId: String) {
    eventMap.put(SENDERID, senderId)
  }

  def setSenderRole(senderRole: String): Unit = {
    eventMap.put(SENDER_ROLE, senderRole)
  }

  def setChatEmphasizedText(chatEmphasizedText: Boolean): Unit = {
    eventMap.put(CHAT_EMPHASIZED_TEXT, chatEmphasizedText.toString)
  }

  def setMessage(message: String) {
    eventMap.put(MESSAGE, message)
  }
}

object PublicChatRecordEvent {
  private final val SENDERID = "senderId"
  private final val MESSAGE = "message"
  private final val SENDER_ROLE = "senderRole"
  private final val CHAT_EMPHASIZED_TEXT = "chatEmphasizedText"
}
