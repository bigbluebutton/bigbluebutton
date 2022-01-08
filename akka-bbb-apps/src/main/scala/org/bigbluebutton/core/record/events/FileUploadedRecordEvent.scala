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

class FileUploadedRecordEvent extends AbstractUploadRecordEvent {
  import FileUploadedRecordEvent._

  setEvent("FileUploadedEvent")

  def setUserId(userId: String) {
    eventMap.put(USER_ID, userId)
  }

  def setUploadId(uploadId: String) {
    eventMap.put(UPLOAD_ID, uploadId)
  }

  def setSource(source: String) {
    eventMap.put(SOURCE, source)
  }

  def setFilename(filename: String) {
    eventMap.put(FILENAME, filename)
  }
}

object FileUploadedRecordEvent {
  protected final val USER_ID = "userId"
  protected final val UPLOAD_ID = "uploadId"
  protected final val SOURCE = "source"
  protected final val FILENAME = "filename"
}
