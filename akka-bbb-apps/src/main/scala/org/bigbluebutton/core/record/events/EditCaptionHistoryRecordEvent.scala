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

class EditCaptionHistoryRecordEvent extends AbstractCaptionRecordEvent {
  import EditCaptionHistoryRecordEvent._

  setEvent("EditCaptionHistoryEvent")

  def setStartIndex(startIndex: Integer) {
    eventMap.put(START_INDEX, startIndex.toString)
  }

  def setEndIndex(endIndex: Integer) {
    eventMap.put(END_INDEX, endIndex.toString)
  }

  def setLocale(locale: String) {
    eventMap.put(LOCALE, locale)
  }

  def setLocaleCode(localeCode: String) {
    eventMap.put(LOCALE_CODE, localeCode)
  }

  def setText(text: String) {
    eventMap.put(TEXT, text)
  }
}

object EditCaptionHistoryRecordEvent {
  protected final val START_INDEX = "startIndex"
  protected final val END_INDEX = "endIndex"
  protected final val LOCALE = "locale"
  protected final val LOCALE_CODE = "localeCode"
  protected final val TEXT = "text"
}