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

import org.bigbluebutton.common2.msgs.{ AnnotationVO, ExportJob, StoredAnnotations, PresentationPageForExport }
import org.bigbluebutton.common2.util.JsonUtil

class StoreExportJobInRedisPresAnnEvent extends AbstractPresentationWithAnnotations {
  import StoreExportJobInRedisPresAnnEvent._

  setEvent("StoreExportJobInRedisPresAnnEvent")

  def setJobId(jobId: String) {
    eventMap.put(JOB_ID, jobId)
  }

  def setJobType(jobType: String) {
    eventMap.put(JOB_TYPE, jobType)
  }

  def setFilename(filename: String) {
    eventMap.put(FILENAME, filename)
  }

  def setPresId(presId: String) {
    eventMap.put(PRES_ID, presId)
  }

  def setPresLocation(presLocation: String) {
    eventMap.put(PRES_LOCATION, presLocation)
  }

  def setAllPages(allPages: String) {
    eventMap.put(ALL_PAGES, allPages)
  }

  def setPages(pages: List[Int]) {
    eventMap.put(PAGES, JsonUtil.toJson(pages))
  }

  def setParentMeetingId(parentMeetingId: String) {
    eventMap.put(PARENT_MEETING_ID, parentMeetingId)
  }

  def setPresentationUploadToken(presentationUploadToken: String) {
    eventMap.put(PRESENTATION_UPLOAD_TOKEN, presentationUploadToken)
  }
}

object StoreExportJobInRedisPresAnnEvent {
  protected final val JOB_ID = "jobId"
  protected final val JOB_TYPE = "jobType"
  protected final val FILENAME = "filename"
  protected final val PRES_ID = "presId"
  protected final val PRES_LOCATION = "presLocation"
  protected final val ALL_PAGES = "allPages"
  protected final val PAGES = "pages"
  protected final val PARENT_MEETING_ID = "parentMeetingId"
  protected final val PRESENTATION_UPLOAD_TOKEN = "presentationUploadToken"
}
