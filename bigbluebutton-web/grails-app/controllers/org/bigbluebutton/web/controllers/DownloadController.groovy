package org.bigbluebutton.web.controllers

import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.util.ParamsUtil
import org.bigbluebutton.api.Util

class DownloadController {
  MeetingService meetingService
  ParamsProcessorUtil paramsProcessorUtil

  def check = {
    def uri = request.getHeader("x-original-uri")
    def source = request.getHeader("x-source")
    def uploadId = request.getHeader("x-upload-id")

    def sessionToken = ParamsUtil.getSessionToken(uri)
    def userSession = meetingService.getUserSessionWithAuthToken(sessionToken)
    if (userSession != null) {
      def meetingId = userSession.meetingID

      def validRequest = meetingService.isDownloadRequestValid(meetingId, source, uploadId)

      if (validRequest) {
        response.setStatus(200)
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'valid-download'
      } else {
        log.debug("Download failed. Invalid.")
        response.setStatus(404)
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'invalid-download'
      }
    } else {
      log.debug("Download failed. Invalid session.")
      response.setStatus(404)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'invalid-session'
    }
  }

  def download = {
    def uri = request.getHeader("x-original-uri")
    def sessionToken = ParamsUtil.getSessionToken(uri)
    def userSession = meetingService.getUserSessionWithAuthToken(sessionToken)

    def meetingId = userSession.meetingID
    def meeting = meetingService.getNotEndedMeetingWithId(meetingId)
    if (meeting == null) {
      log.debug("Download failed. No meeting running " + meetingId + ".")
      response.setStatus(404)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'no-meeting'
    } else {
      def source = request.getHeader("x-source")
      def uploadId = request.getHeader("x-upload-id")
      try {
        def rootDir = paramsProcessorUtil.getUploadDir()
        def uploadedFile = meetingService.getUploadedFile(meetingId, uploadId)
        def downloadPath = Util.getDownloadPath(rootDir, source, meetingId, uploadId)
        def filename = uploadId + "." + uploadedFile.extension
        def file = new File(downloadPath + File.separatorChar + filename)
        if (file.exists()) {
          def bytes = file.readBytes()
          response.addHeader("Cache-Control", "no-cache")
          response.contentType = uploadedFile.contentType
          response.outputStream << bytes;
        } else {
          log.debug("Download failed. No meeting running " + meetingId + ".")
          response.setStatus(404)
          response.addHeader("Cache-Control", "no-cache")
          response.contentType = 'plain/text'
          response.outputStream << 'no-meeting'
        }
      } catch (IOException e) {
        log.debug("Download failed.")
      }
    }
  }
}
