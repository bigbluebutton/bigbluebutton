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

/**
 * One caption segment (an utterance of a speaker, or a typed caption) as it is
 * stored for the live view: every update carries the whole text of the segment,
 * so the recording can be replayed as upserts keyed by captionId.
 */
class CaptionUpdatedRecordEvent extends AbstractCaptionRecordEvent {
  import CaptionUpdatedRecordEvent._

  setEvent("CaptionUpdatedEvent")

  def setCaptionId(captionId: String) {
    eventMap.put(CAPTION_ID, captionId)
  }

  def setUserId(userId: String) {
    eventMap.put(USER_ID, userId)
  }

  def setLocale(locale: String) {
    eventMap.put(LOCALE, locale)
  }

  def setCaptionType(captionType: String) {
    eventMap.put(CAPTION_TYPE, captionType)
  }

  def setText(text: String) {
    eventMap.put(TEXT, text)
  }

  def setIsFinal(isFinal: Boolean) {
    eventMap.put(IS_FINAL, isFinal.toString)
  }
}

object CaptionUpdatedRecordEvent {
  protected final val CAPTION_ID = "captionId"
  protected final val USER_ID = "userId"
  protected final val LOCALE = "locale"
  protected final val CAPTION_TYPE = "captionType"
  protected final val TEXT = "text"
  protected final val IS_FINAL = "isFinal"
}
