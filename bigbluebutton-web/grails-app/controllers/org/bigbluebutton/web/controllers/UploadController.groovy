package org.bigbluebutton.web.controllers

import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil

class UploadController {
  MeetingService meetingService
  ParamsProcessorUtil paramsProcessorUtil

  def check = {
    try {
      def filename = null
      def file = request.getFile('file')
      if (file && !file.empty) {
        filename = file.getOriginalFilename()
      }

      def userId = request.getHeader("x-user-id")
      def token = request.getHeader("x-token")
      def source = request.getHeader("x-source")

      def contentLength = request.getHeader("x-content-length")

      def uploadSize = 0
      if (contentLength.isNumber()) {
        uploadSize = contentLength as int
      }

      def meetingId = params.conference
      def validRequest = meetingService.isUploadRequestValid(meetingId, source, filename, userId, token)

      def maxUploadSize = paramsProcessorUtil.getMaxUploadSize()
      def validSize = uploadSize != 0 && uploadSize < maxUploadSize

      if (validRequest && validSize) {
        response.setStatus(200)
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'valid-upload'
      } else {
        response.setStatus(404)
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'invalid-upload'
      }
    } catch (IOException e) {
      log.error("Error while validating media upload.\n" + e.getMessage())
    }
  }

  def upload = {
    def meetingId = params.conference
    def meeting = meetingService.getNotEndedMeetingWithId(meetingId)
    if (meeting == null) {
      log.debug("Upload failed. No meeting running " + meetingId)
      response.setStatus(404)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'no-meeting'
    } else {
      response.setStatus(200)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'upload-success'
    }
  }
}
