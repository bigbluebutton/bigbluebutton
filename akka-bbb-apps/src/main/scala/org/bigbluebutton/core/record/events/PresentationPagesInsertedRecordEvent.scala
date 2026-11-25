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

/** Pages were inserted into a presentation: pageIds lists every page of it after the insert. */
class PresentationPagesInsertedRecordEvent extends AbstractPresentationRecordEvent {
  import PresentationPagesInsertedRecordEvent._

  setEvent("PresentationPagesInsertedEvent")

  def setPresentationName(name: String) {
    eventMap.put(PRES_NAME, name)
  }

  /** Page ids of the presentation, in page order, comma separated. */
  def setPageIds(pageIds: Seq[String]) {
    eventMap.put(PAGE_IDS, pageIds.mkString(","))
  }
}

object PresentationPagesInsertedRecordEvent {
  private final val PRES_NAME = "presentationName"
  private final val PAGE_IDS = "pageIds"
}
